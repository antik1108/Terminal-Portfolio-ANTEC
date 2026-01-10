import jwt from 'jsonwebtoken';
import { 
  verifySecureToken, 
  extractTokenFromHeader, 
  isTokenBlacklisted 
} from '../utils/jwtUtils.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = verifySecureToken(token, { 
      requireTokenType: 'access' 
    });
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(decoded.jti)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('Token verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
};