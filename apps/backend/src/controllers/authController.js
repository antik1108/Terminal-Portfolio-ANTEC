import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { 
  generateSecureToken, 
  generateRefreshToken,
  blacklistToken,
  refreshAccessToken
} from '../utils/jwtUtils.js';

// Generate JWT token with enhanced security
const generateToken = (payload) => {
  return generateSecureToken(payload);
};

// Signup controller
export const signup = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path || error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      const message = field === 'email' ? 'Email already registered' : 'Username already exists';
      return res.status(409).json({
        success: false,
        message,
        code: `${field.toUpperCase()}_EXISTS`,
        errors: [{
          field,
          message,
          value: field === 'email' ? email : username
        }]
      });
    }

    // Hash password with enhanced security
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 14; // Increased from 12 to 14 for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate tokens
    const token = generateToken({
      userId: user._id,
      username: user.username,
      email: user.email
    });
    
    const refreshToken = generateRefreshToken({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // Return success response (auto-login)
    res.status(201).json({
      success: true,
      message: '✔ Account created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email' ? 'Email already registered' : 'Username already exists';
      return res.status(409).json({
        success: false,
        message,
        code: `${field.toUpperCase()}_EXISTS`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path || error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }

    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({
      userId: user._id,
      username: user.username,
      email: user.email
    });
    
    const refreshToken = generateRefreshToken({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    res.json({
      success: true,
      message: '✔ Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // If user is authenticated (token provided), blacklist the token
    if (req.user && req.user.jti) {
      blacklistToken(req.user.jti, req.user.exp);
    }
    
    res.json({
      success: true,
      message: '✔ Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path || error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }

    const { refreshToken: token } = req.body;

    try {
      const result = refreshAccessToken(token);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        token: result.accessToken,
        user: result.user
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
        code: 'REFRESH_FAILED'
      });
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};

// Get current user controller
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    
    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
        code: 'INVALID_USER_ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};