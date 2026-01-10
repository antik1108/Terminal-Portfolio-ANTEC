/**
 * Enhanced JWT utilities with security best practices
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Validates JWT secret strength
 * @param {string} secret - JWT secret to validate
 * @returns {boolean} - Whether the secret meets security requirements
 */
export const validateJWTSecret = (secret) => {
  if (!secret || typeof secret !== 'string') {
    return false;
  }
  
  // Minimum 32 characters for security
  if (secret.length < 32) {
    return false;
  }
  
  // Should not be the default example secret
  if (secret.includes('your-super-secret-jwt-key') || secret === 'secret') {
    return false;
  }
  
  return true;
};

/**
 * Generates a secure JWT token with enhanced security options
 * @param {Object} payload - Token payload
 * @param {Object} options - Token options
 * @returns {string} - Signed JWT token
 */
export const generateSecureToken = (payload, options = {}) => {
  const secret = process.env.JWT_SECRET;
  
  // Validate secret strength
  if (!validateJWTSecret(secret)) {
    throw new Error('JWT_SECRET is not secure enough. Must be at least 32 characters and not use default values.');
  }
  
  // Extract tokenType from options before passing to jwt.sign
  const { tokenType, ...jwtOptions } = options;
  
  // Enhanced token options with security best practices
  const tokenOptions = {
    expiresIn: jwtOptions.expiresIn || process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'antec-terminal',
    audience: process.env.JWT_AUDIENCE || 'antec-users',
    algorithm: 'HS256', // Explicitly specify algorithm to prevent algorithm confusion attacks
    jwtid: crypto.randomUUID(), // Unique token ID for tracking/revocation
    ...jwtOptions
  };
  
  // Add security claims to payload
  const securePayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    tokenType: tokenType || 'access' // Token type for validation
  };
  
  return jwt.sign(securePayload, secret, tokenOptions);
};

/**
 * Generates a refresh token with longer expiration
 * @param {Object} payload - Token payload
 * @returns {string} - Signed refresh token
 */
export const generateRefreshToken = (payload) => {
  return generateSecureToken(payload, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    tokenType: 'refresh'
  });
};

/**
 * Verifies JWT token with enhanced security checks
 * @param {string} token - JWT token to verify
 * @param {Object} options - Verification options
 * @returns {Object} - Decoded token payload
 */
export const verifySecureToken = (token, options = {}) => {
  const secret = process.env.JWT_SECRET;
  
  if (!validateJWTSecret(secret)) {
    throw new Error('JWT_SECRET is not secure enough');
  }
  
  const verifyOptions = {
    issuer: process.env.JWT_ISSUER || 'antec-terminal',
    audience: process.env.JWT_AUDIENCE || 'antec-users',
    algorithms: ['HS256'], // Only allow HS256 to prevent algorithm confusion
    ...options
  };
  
  try {
    const decoded = jwt.verify(token, secret, verifyOptions);
    
    // Additional security checks
    if (options.requireTokenType && decoded.tokenType !== options.requireTokenType) {
      throw new Error(`Invalid token type. Expected: ${options.requireTokenType}, Got: ${decoded.tokenType}`);
    }
    
    return decoded;
  } catch (error) {
    // Re-throw with more specific error information
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token format or signature');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw error;
    }
  }
};

/**
 * Extracts token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  // Support both "Bearer token" and "token" formats
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return null;
};

/**
 * Creates token blacklist entry (for logout/revocation)
 * In a production system, this would typically use Redis or a database
 * @param {string} jti - JWT ID to blacklist
 * @param {number} exp - Token expiration timestamp
 */
export const blacklistToken = (jti, exp) => {
  // In a real implementation, store this in Redis with TTL = exp - now
  // For now, we'll use a simple in-memory store (not suitable for production)
  if (!global.tokenBlacklist) {
    global.tokenBlacklist = new Set();
  }
  
  global.tokenBlacklist.add(jti);
  
  // Clean up expired tokens periodically
  setTimeout(() => {
    global.tokenBlacklist.delete(jti);
  }, (exp * 1000) - Date.now());
};

/**
 * Checks if token is blacklisted
 * @param {string} jti - JWT ID to check
 * @returns {boolean} - Whether token is blacklisted
 */
export const isTokenBlacklisted = (jti) => {
  return global.tokenBlacklist && global.tokenBlacklist.has(jti);
};

/**
 * Refreshes an access token using a refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {Object} - New access token and user info
 */
export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifySecureToken(refreshToken, { 
      requireTokenType: 'refresh' 
    });
    
    // Check if refresh token is blacklisted
    if (isTokenBlacklisted(decoded.jti)) {
      throw new Error('Refresh token has been revoked');
    }
    
    // Generate new access token with same user data
    const newAccessToken = generateSecureToken({
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    });
    
    return {
      accessToken: newAccessToken,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email
      }
    };
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
};