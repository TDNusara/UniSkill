const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'supervisor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Student-specific fields
    studentId: {
      type: String,
      trim: true,
    },
    batchYear: {
      type: String,
      default: '',
    },
    skills: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Skill',
        },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Intermediate',
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    education: [
      {
        degree: { type: String, default: '' },
        institution: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
      },
    ],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },

    // Supervisor-specific fields
    designation: {
      type: String,
      default: 'Lecturer',
    },
    researchInterests: [
      {
        type: String,
        trim: true,
      },
    ],
    maxSupervisionCapacity: {
      type: Number,
      default: 5,
    },
    officeLocation: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
