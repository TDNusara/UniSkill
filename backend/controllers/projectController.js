const Project = require('../models/Project');
const ProjectRequest = require('../models/ProjectRequest');
const Milestone = require('../models/Milestone');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all public / approved / in_progress projects with filters
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res, next) => {
  try {
    const { department, skill, status, search, lookingForMembers, creator } = req.query;
    let query = {};

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (creator) {
      query.creator = creator;
    }

    if (lookingForMembers === 'true') {
      query.isLookingForMembers = true;
    }

    if (skill) {
      query.requiredSkills = { $in: [skill] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query)
      .populate('creator', 'name email avatar role studentId')
      .populate('supervisor', 'name email avatar designation')
      .populate('requestedSupervisor', 'name email avatar designation')
      .populate('members.user', 'name email avatar role studentId skills')
      .populate('department', 'name code')
      .populate('requiredSkills', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Public
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name email avatar role studentId department')
      .populate('supervisor', 'name email avatar designation researchInterests officeLocation')
      .populate('requestedSupervisor', 'name email avatar designation researchInterests officeLocation department')
      .populate('members.user', 'name email avatar role studentId skills')
      .populate('department', 'name code')
      .populate('requiredSkills', 'name category');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const milestones = await Milestone.find({ project: project._id }).sort({ dueDate: 1 });

    const latestSupervisorRequest = await ProjectRequest.findOne({
      project: project._id,
      type: 'supervisor_request',
    })
      .populate('recipient', 'name email avatar designation researchInterests officeLocation department')
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      project,
      milestones,
      latestSupervisorRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Student / Supervisor)
exports.createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      objectives,
      category,
      department,
      academicYear,
      requiredSkills,
      maxMembers,
      isLookingForMembers,
      githubRepo,
      liveDemoUrl,
      supervisorId,
    } = req.body;

    const isSupervisorCreator = req.user.role === 'supervisor';
    const assignedSupervisor = isSupervisorCreator ? req.user._id : null;
    const hasRequestedSupervisor = !isSupervisorCreator && Boolean(supervisorId);

    const project = await Project.create({
      title,
      description,
      objectives: Array.isArray(objectives) ? objectives : [objectives].filter(Boolean),
      category: category || 'Academic Project',
      department: department || req.user.department || null,
      academicYear: academicYear || new Date().getFullYear().toString(),
      requiredSkills: requiredSkills || [],
      maxMembers: maxMembers || 4,
      isLookingForMembers: isLookingForMembers !== undefined ? isLookingForMembers : true,
      githubRepo: githubRepo || '',
      liveDemoUrl: liveDemoUrl || '',
      creator: req.user._id,
      supervisor: assignedSupervisor,
      requestedSupervisor: hasRequestedSupervisor ? supervisorId : null,
      supervisorRequestStatus: isSupervisorCreator
        ? 'accepted'
        : hasRequestedSupervisor
        ? 'pending'
        : 'none',
      rejectionReason: '',
      members: [
        {
          user: req.user._id,
          role: 'Leader',
          joinedAt: new Date(),
        },
      ],
      status: 'in_progress', // Active project
    });

    // If supervisor is requested during creation, send supervisor request & notification
    if (hasRequestedSupervisor) {
      await ProjectRequest.create({
        type: 'supervisor_request',
        project: project._id,
        sender: req.user._id,
        recipient: supervisorId,
        message: `Project supervision request for: ${title}`,
      });

      try {
        await Notification.create({
          recipient: supervisorId,
          sender: req.user._id,
          title: 'New Project Supervision Request',
          message: `${req.user.name} requested you to supervise the academic project "${title}".`,
          type: 'supervisor_request',
          link: '/requests',
        });
      } catch (notifErr) {
        console.error('Error creating notification:', notifErr);
      }
    }

    // Create 4 initial default milestones for the project
    const defaultMilestones = [
      {
        project: project._id,
        title: 'Project Proposal & Requirement Analysis',
        description: 'Define scope, literature review, and architecture diagrams.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        weightPercentage: 25,
      },
      {
        project: project._id,
        title: 'System Design & Prototype',
        description: 'Database schema, UI wireframes, and preliminary proof of concept.',
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        weightPercentage: 25,
      },
      {
        project: project._id,
        title: 'Core Implementation & Testing',
        description: 'Build core modules, unit testing, and integration verification.',
        dueDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
        weightPercentage: 25,
      },
      {
        project: project._id,
        title: 'Final Report & Presentation',
        description: 'Final documentation, demonstration video, and deployment.',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        weightPercentage: 25,
      },
    ];
    await Milestone.insertMany(defaultMilestones);

    const populatedProject = await Project.findById(project._id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('department', 'name code')
      .populate('requiredSkills', 'name category');

    res.status(201).json({
      success: true,
      project: populatedProject,
      message: 'Project created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (Project Leader / Admin)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check authorization: must be creator or admin
    const isCreator = project.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this project',
      });
    }

    const {
      title,
      description,
      objectives,
      category,
      department,
      academicYear,
      requiredSkills,
      maxMembers,
      isLookingForMembers,
      githubRepo,
      liveDemoUrl,
      status,
      progress,
    } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (objectives) project.objectives = Array.isArray(objectives) ? objectives : [objectives];
    if (category) project.category = category;
    if (department) project.department = department;
    if (academicYear) project.academicYear = academicYear;
    if (requiredSkills) project.requiredSkills = requiredSkills;
    if (maxMembers) project.maxMembers = maxMembers;
    if (isLookingForMembers !== undefined) project.isLookingForMembers = isLookingForMembers;
    if (githubRepo !== undefined) project.githubRepo = githubRepo;
    if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl;
    if (status) project.status = status;
    if (progress !== undefined) project.progress = progress;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('creator', 'name email avatar')
      .populate('supervisor', 'name email avatar designation')
      .populate('members.user', 'name email avatar')
      .populate('department', 'name code')
      .populate('requiredSkills', 'name category');

    res.json({
      success: true,
      project: updated,
      message: 'Project updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Project Leader / Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isCreator = project.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    await Milestone.deleteMany({ project: project._id });
    await ProjectRequest.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to join a project group
// @route   POST /api/projects/:id/join
// @access  Private (Student)
exports.requestJoinProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if already a member
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project group',
      });
    }

    // Check capacity
    if (project.members.length >= project.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'This project group has reached its maximum member limit',
      });
    }

    // Check existing pending request
    const existingReq = await ProjectRequest.findOne({
      project: project._id,
      sender: req.user._id,
      type: 'join_group',
      status: 'pending',
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending join request for this project',
      });
    }

    const { message } = req.body;

    const newRequest = await ProjectRequest.create({
      type: 'join_group',
      project: project._id,
      sender: req.user._id,
      recipient: project.creator, // leader receives request
      message: message || `Hi, I would love to join your project "${project.title}".`,
    });

    res.status(201).json({
      success: true,
      request: newRequest,
      message: 'Join request sent to project leader',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's active projects (as member, creator, or supervisor)
// @route   GET /api/projects/my/projects
// @access  Private
exports.getMyProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { 'members.user': req.user._id };
    } else if (req.user.role === 'supervisor') {
      query = { supervisor: req.user._id };
    } else {
      query = {}; // Admin sees all
    }

    const projects = await Project.find(query)
      .populate('creator', 'name email avatar')
      .populate('supervisor', 'name email avatar designation')
      .populate('members.user', 'name email avatar role studentId')
      .populate('department', 'name code')
      .populate('requiredSkills', 'name category')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};
