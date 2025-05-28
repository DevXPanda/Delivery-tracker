import express from 'express';
import { UserModel } from '../models/User';
import { generateToken, authenticate } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, vendorInfo, deliveryInfo } = req.body;
    
    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Validate role-specific information
    if (role === 'vendor' && !vendorInfo) {
      return res.status(400).json({ message: 'Vendor information required' });
    }
    
    if (role === 'delivery' && !deliveryInfo) {
      return res.status(400).json({ message: 'Delivery partner information required' });
    }
    
    // Create new user
    const user = new UserModel({
      name,
      email,
      password,
      role,
      phone,
      address,
      vendorInfo,
      deliveryInfo
    });
    
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role);
    
    // Return user data (excluding password) and token
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role);
    
    // Return user data and token
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, phone, address, vendorInfo, deliveryInfo } = req.body;
    
    // Find user
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    // Update role-specific info
    if (user.role === 'vendor' && vendorInfo) {
      user.vendorInfo = {
        ...user.vendorInfo,
        ...vendorInfo
      };
    }
    
    if (user.role === 'delivery' && deliveryInfo) {
      user.deliveryInfo = {
        ...user.deliveryInfo,
        ...deliveryInfo
      };
    }
    
    await user.save();
    
    // Return updated user (excluding password)
    const updatedUser = await UserModel.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

export default router;