import express from 'express';
import { OrderModel } from '../models/Order';
import { UserModel } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Create a new order (for vendors)
router.post('/', authenticate, authorize(['vendor']), async (req, res) => {
  try {
    const {
      customerId,
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      pickupAddress,
      estimatedDeliveryTime,
      notes
    } = req.body;
    
    // Validate customer exists
    const customer = await UserModel.findById(customerId);
    if (!customer || customer.role !== 'customer') {
      return res.status(400).json({ message: 'Invalid customer' });
    }
    
    // Create new order
    const order = new OrderModel({
      vendorId: req.user.id,
      customerId,
      items,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      pickupAddress,
      estimatedDeliveryTime,
      notes
    });
    
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// Get all orders for vendor
router.get('/vendor', authenticate, authorize(['vendor']), async (req, res) => {
  try {
    const orders = await OrderModel.find({ vendorId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders for delivery partner
router.get('/delivery', authenticate, authorize(['delivery']), async (req, res) => {
  try {
    const orders = await OrderModel.find({ deliveryPartnerId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders for customer
router.get('/customer', authenticate, authorize(['customer']), async (req, res) => {
  try {
    const orders = await OrderModel.find({ customerId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions based on user role
    if (
      req.user.role === 'vendor' && order.vendorId.toString() !== req.user.id ||
      req.user.role === 'delivery' && order.deliveryPartnerId?.toString() !== req.user.id ||
      req.user.role === 'customer' && order.customerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to access this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign delivery partner to order (for vendors)
router.put('/:id/assign', authenticate, authorize(['vendor']), async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    
    // Validate delivery partner exists
    const deliveryPartner = await UserModel.findById(deliveryPartnerId);
    if (!deliveryPartner || deliveryPartner.role !== 'delivery') {
      return res.status(400).json({ message: 'Invalid delivery partner' });
    }
    
    // Find order
    const order = await OrderModel.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if vendor owns this order
    if (order.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to modify this order' });
    }
    
    // Update order
    order.deliveryPartnerId = deliveryPartnerId;
    order.status = 'assigned';
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Assign delivery partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find order
    const order = await OrderModel.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions based on user role and requested status
    if (req.user.role === 'vendor') {
      if (order.vendorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: Not authorized to modify this order' });
      }
      
      // Vendors can only change status to accepted, cancelled
      if (!['accepted', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status for vendor' });
      }
    } else if (req.user.role === 'delivery') {
      if (order.deliveryPartnerId?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: Not authorized to modify this order' });
      }
      
      // Delivery partners can only change status to picked_up, in_transit, delivered
      if (!['picked_up', 'in_transit', 'delivered'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status for delivery partner' });
      }
    } else {
      return res.status(403).json({ message: 'Forbidden: Not authorized to modify order status' });
    }
    
    // Update order status
    order.status = status;
    
    // If delivered, set actual delivery time
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;