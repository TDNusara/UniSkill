const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required (e.g. CSE, EEE)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    degrees: [
      {
        name: {
          type: String,
          required: [true, 'Degree name is required'],
          trim: true,
        },
        code: {
          type: String,
          trim: true,
          default: '',
        },
        durationYears: {
          type: Number,
          default: 4,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
