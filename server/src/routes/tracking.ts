import express from 'express';
import { LocationModel } from '../models/Location';
import { OrderModel } from '../models/Order';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get location history for an order
router.get('/:orderId/history', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order to check permissions
    const order = await OrderModel.findById(orderId);
    
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
    
    // Get location history
    const locations = await LocationModel.find({ orderId })
      .sort({ timestamp: 1 });
    
    res.json(locations);
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest location for an order
router.get('/:orderId/latest', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order to check permissions
    const order = await OrderModel.findById(orderId);
    
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
    
    // Get latest location
    const location = await LocationModel.findOne({ orderId })
      .sort({ timestamp: -1 });
    
    if (!location) {
      return res.status(404).json({ message: 'No location data available' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Get latest location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a location update (for delivery partners)
router.post('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng } = req.body;
    
    // Find order to check permissions
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is the assigned delivery partner
    if (req.user.role !== 'delivery' || order.deliveryPartnerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to update location for this order' });
    }
    
    // Create location update
    const location = new LocationModel({
      orderId,
      deliveryPartnerId: req.user.id,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      timestamp: Date.now()
    });
    
    await location.save();
    
    res.status(201).json(location);
  } catch (error) {
    console.error('Create location update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;