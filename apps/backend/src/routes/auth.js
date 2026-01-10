import express from 'express';
import { body } from 'express-validator';
import { 
  signup, 
  login, 
  logout, 
  getCurrentUser,
  refreshToken
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validatePasswordStrength } from '../utils/passwordValidator.js';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .custom((value) => {
      const validation = validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }
      return true;
    }),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', authenticateToken, logout); // Require auth for proper token blacklisting
router.post('/refresh', refreshTokenValidation, refreshToken);
router.get('/me', authenticateToken, getCurrentUser);

export default router;