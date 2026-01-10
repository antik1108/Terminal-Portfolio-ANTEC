export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = field === 'email' ? 'Email already registered' : 'Username already exists';
    
    return res.status(409).json({
      success: false,
      message,
      code: `${field.toUpperCase()}_EXISTS`,
      errors: [{
        field,
        message,
        value: err.keyValue[field]
      }]
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error. Please try again later.',
      code: 'DATABASE_ERROR'
    });
  }

  // Rate limiting errors (if using express-rate-limit)
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMITED'
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
};