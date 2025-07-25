const User = require('../models/User');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, location, address } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: formattedPhone,
      password,
      role,
      location: location ? {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      } : {
        type: 'Point',
        coordinates: [36.8219, -1.2921]
      },
      address
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscription: user.subscription,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    let subscriptionStatus = 'free';
    if (user.subscriptionExpiry && user.subscriptionExpiry > new Date()) {
      subscriptionStatus = user.subscription;
    } else if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
      await User.findByIdAndUpdate(user._id, { subscription: 'free' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscription: subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const activeSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        activeSubscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, location } = req.body;

    const updateData = { name, phone, address };

    if (location) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Password reset functionality will be implemented'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};