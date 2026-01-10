import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username must be less than 50 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [128, 'Password must be less than 128 characters long']
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc, ret) {
      // Remove password from JSON output
      delete ret.password;
      return ret;
    }
  }
});

// Create indexes for performance and uniqueness
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1, username: 1 }); // Compound index for login queries

// Pre-save middleware to ensure email is lowercase
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;