const Milestone = require('../models/Milestone');
const Project = require('../models/Project');

// Helper to recalculate project progress
const recalculateProjectProgress = async (projectId) => {
  const milestones = await Milestone.find({ project: projectId });
  if (milestones.length === 0) return 0;

  const totalWeight = milestones.reduce((sum, m) => sum + (m.weightPercentage || 25), 0);
  const completedWeight = milestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + (m.weightPercentage || 25), 0);

  const calculatedProgress = Math.round((completedWeight / totalWeight) * 100);
  await Project.findByIdAndUpdate(projectId, { progress: Math.min(100, calculatedProgress) });
  return calculatedProgress;
};

// @desc    Get milestones for a project
// @route   GET /api/milestones/project/:projectId
// @access  Private / Public
exports.getProjectMilestones = async (req, res, next) => {
  try {
    const milestones = await Milestone.find({ project: req.params.projectId })
      .populate('tasks.assignedTo', 'name avatar')
      .populate('feedback.supervisor', 'name designation avatar')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: milestones.length,
      milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a milestone for a project
// @route   POST /api/milestones
// @access  Private (Leader or Supervisor)
exports.createMilestone = async (req, res, next) => {
  try {
    const { projectId, title, description, dueDate, weightPercentage, tasks } = req.body;

    const milestone = await Milestone.create({
      project: projectId,
      title,
      description,
      dueDate,
      weightPercentage: weightPercentage || 25,
      tasks: tasks || [],
      status: 'pending',
    });

    await recalculateProjectProgress(projectId);

    res.status(201).json({
      success: true,
      milestone,
      message: 'Milestone created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone (tasks / details)
// @route   PUT /api/milestones/:id
// @access  Private
exports.updateMilestone = async (req, res, next) => {
  try {
    const { title, description, dueDate, weightPercentage, tasks, status } = req.body;

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (dueDate) milestone.dueDate = dueDate;
    if (weightPercentage !== undefined) milestone.weightPercentage = weightPercentage;
    if (tasks !== undefined) milestone.tasks = tasks;
    if (status) milestone.status = status;

    await milestone.save();
    await recalculateProjectProgress(milestone.project);

    res.json({
      success: true,
      milestone,
      message: 'Milestone updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit deliverable for milestone
// @route   POST /api/milestones/:id/submit
// @access  Private (Project Member)
exports.submitMilestone = async (req, res, next) => {
  try {
    const { text, fileUrl } = req.body;

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.submission = {
      text: text || '',
      fileUrl: fileUrl || '',
      submittedAt: new Date(),
    };
    milestone.status = 'submitted';

    await milestone.save();

    res.json({
      success: true,
      milestone,
      message: 'Deliverable submitted for review',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supervisor feedback and approval
// @route   POST /api/milestones/:id/review
// @access  Private (Supervisor / Admin)
exports.reviewMilestone = async (req, res, next) => {
  try {
    const { status, comment, grade } = req.body; // status: 'approved' | 'revision_requested'

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.status = status || 'approved';
    milestone.feedback = {
      supervisor: req.user._id,
      comment: comment || '',
      grade: grade || '',
      reviewedAt: new Date(),
    };

    await milestone.save();
    await recalculateProjectProgress(milestone.project);

    res.json({
      success: true,
      milestone,
      message: `Milestone marked as ${milestone.status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task item completion status
// @route   PATCH /api/milestones/:id/task/:taskId
// @access  Private (Project Member)
exports.toggleTaskStatus = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    const task = milestone.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task item not found' });
    }

    task.isCompleted = !task.isCompleted;
    await milestone.save();

    res.json({
      success: true,
      milestone,
      message: 'Task updated',
    });
  } catch (error) {
    next(error);
  }
};
