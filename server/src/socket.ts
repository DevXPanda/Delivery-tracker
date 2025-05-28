import { Server, Socket } from 'socket.io';
import { verifyToken } from './middleware/auth';
import { OrderModel } from './models/Order';
import { LocationModel } from './models/Location';

interface LocationUpdate {
  orderId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export const socketHandler = (io: Server) => {
  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error'));
      }
      
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    const { user } = socket.data;

    // Join room based on user role
    if (user.role === 'vendor') {
      socket.join(`vendor-${user.id}`);
    } else if (user.role === 'delivery') {
      socket.join(`delivery-${user.id}`);
    } else if (user.role === 'customer') {
      socket.join(`customer-${user.id}`);
    }

    // Handle location updates from delivery partners
    socket.on('location:update', async (data: LocationUpdate) => {
      try {
        const { orderId, lat, lng, timestamp } = data;
        
        // Validate the delivery partner is assigned to this order
        const order = await OrderModel.findById(orderId);
        if (!order || order.deliveryPartnerId.toString() !== user.id) {
          return;
        }
        
        // Save location update
        const location = new LocationModel({
          orderId,
          deliveryPartnerId: user.id,
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          timestamp: timestamp || Date.now()
        });
        
        await location.save();
        
        // Broadcast to relevant rooms
        io.to(`order-${orderId}`).emit('location:updated', {
          orderId,
          lat,
          lng,
          timestamp: location.timestamp
        });
        
        // Also emit to vendor room
        io.to(`vendor-${order.vendorId}`).emit('location:updated', {
          orderId,
          lat,
          lng,
          timestamp: location.timestamp
        });
        
        // Also emit to customer room
        io.to(`customer-${order.customerId}`).emit('location:updated', {
          orderId,
          lat,
          lng,
          timestamp: location.timestamp
        });
      } catch (error) {
        console.error('Error handling location update:', error);
      }
    });

    // Handle status changes
    socket.on('order:status', async (data: { orderId: string, status: string }) => {
      try {
        const { orderId, status } = data;
        
        // Validate the user has permission to update this order
        const order = await OrderModel.findById(orderId);
        if (!order) {
          return;
        }
        
        // Check permissions based on role
        if (
          (user.role === 'vendor' && order.vendorId.toString() !== user.id) ||
          (user.role === 'delivery' && order.deliveryPartnerId?.toString() !== user.id)
        ) {
          return;
        }
        
        // Update order status
        order.status = status;
        await order.save();
        
        // Broadcast to relevant rooms
        io.to(`order-${orderId}`).emit('order:status_updated', {
          orderId,
          status,
          updatedAt: new Date()
        });
        
        // Also emit to vendor room
        io.to(`vendor-${order.vendorId}`).emit('order:status_updated', {
          orderId,
          status,
          updatedAt: new Date()
        });
        
        // Also emit to delivery partner room if assigned
        if (order.deliveryPartnerId) {
          io.to(`delivery-${order.deliveryPartnerId}`).emit('order:status_updated', {
            orderId,
            status,
            updatedAt: new Date()
          });
        }
        
        // Also emit to customer room
        io.to(`customer-${order.customerId}`).emit('order:status_updated', {
          orderId,
          status,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error handling status update:', error);
      }
    });

    // Join order-specific room
    socket.on('order:join', (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    // Leave order-specific room
    socket.on('order:leave', (orderId: string) => {
      socket.leave(`order-${orderId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};