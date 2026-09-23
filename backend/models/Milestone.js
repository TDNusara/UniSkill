const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'revision_requested'],
      default: 'pending',
    },
    weightPercentage: {
      type: Number,
      default: 25,
      min: 1,
      max: 100,
    },
    tasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    submission: {
      text: { type: String, default: '' },
      fileUrl: { type: String, default: '' },
      submittedAt: { type: Date },
    },
    feedback: {
      supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: { type: String, default: '' },
      grade: { type: String, default: '' },
      reviewedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Milestone', milestoneSchema);
