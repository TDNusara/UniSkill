const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile App Development',
        'AI & Machine Learning',
        'Data Science & Analytics',
        'Cloud & DevOps',
        'Cybersecurity',
        'Database & Backend',
        'UI/UX Design',
        'Embedded & IoT',
        'Soft Skills & Management',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
