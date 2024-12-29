import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  coverPicture: {
    type: String,
    default: ''
  },
  bio: {
    title: String,        // e.g., "Comedy club"
    description: String,  // Main bio text
    emojis: [String],    // Array of emojis
    goals: String,       // e.g., "1k goal"
    achievements: String // e.g., "We can achieve 😊 🤓"
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  privacySettings: {
    showDOB: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate initials for fallback profile picture
userSchema.methods.getInitials = function() {
  return this.fullName.split(' ')[0][0].toUpperCase();
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
