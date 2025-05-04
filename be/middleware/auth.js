const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization || req.headers['x-auth-token'];
  console.log('Headers:', { authorization: req.headers.authorization, xAuthToken: req.headers['x-auth-token'] });

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      ...user,
      UserID: decoded.id
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
  }
};

exports.adminOnly = async (req, res, next) => {
  // Allow static admin
  if (req.user && req.user.Email === 'admin' && req.user.role === 'admin' && req.user.UserID === 'static-admin') {
    return next();
  }
  const userRole = await User.getRole(req.user.UserID);
  if (userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden - Admins only' });
  }
};

exports.staffOnly = async (req, res, next) => {
  const userRole = await User.getRole(req.user.UserID);
  if (userRole === 'staff') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden - Staff only' });
  }
};

exports.studentOnly = async (req, res, next) => {
    const userRole = await User.getRole(req.user.UserID);
    if (userRole === 'student') {
        next();
    } else {
      return res.status(403).json({ message: 'Forbidden - STUDENT only' });
    }
  };


exports.validateEquipment = (req, res, next) => {
    const { Name, Amount, Status } = req.body;
    
    if (!Name || !Amount) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['Name', 'Amount']
        });
    }

    if (isNaN(Amount)) {
        return res.status(400).json({ 
            error: 'Amount must be a number'
        });
    }

    const validStatuses = ['Sẵn sàng', 'Đang sử dụng', 'Bảo trì', 'Hỏng'];
    if (Status && !validStatuses.includes(Status)) {
        return res.status(400).json({ 
            error: 'Invalid status',
            validStatuses
        });
    }

    next();
};