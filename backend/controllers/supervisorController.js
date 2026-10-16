const User = require('../models/User');
const Project = require('../models/Project');
const ProjectRequest = require('../models/ProjectRequest');
const Notification = require('../models/Notification');

// @desc    Get directory of supervisors
// @route   GET /api/supervisors
// @access  Public
exports.getSupervisors = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    let query = { role: 'supervisor', isActive: true };

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { researchInterests: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const supervisors = await User.find(query)
      .select('-password')
      .populate('department', 'name code');

    // Attach active supervised projects count to each supervisor
    const supervisorsWithCount = await Promise.all(
      supervisors.map(async (sup) => {
        const activeProjectsCount = await Project.countDocuments({
          supervisor: sup._id,
          status: { $in: ['approved', 'in_progress'] },
        });
        const doc = sup.toObject();
        doc.activeProjectsCount = activeProjectsCount;
        doc.isAvailable = activeProjectsCount < (doc.maxSupervisionCapacity || 5);
        return doc;
      })
    );

    res.json({
      success: true,
      count: supervisorsWithCount.length,
      supervisors: supervisorsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request supervisor for a project
// @route   POST /api/supervisors/request
// @access  Private (Student / Project Leader)
exports.requestSupervision = async (req, res, next) => {
  try {
    const { projectId, supervisorId, message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const supervisor = await User.findOne({ _id: supervisorId, role: 'supervisor' });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // Check existing pending request
    const existing = await ProjectRequest.findOne({
      type: 'supervisor_request',
      project: projectId,
      recipient: supervisorId,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A supervision request has already been submitted to this supervisor',
      });
    }

    const request = await ProjectRequest.create({
      type: 'supervisor_request',
      project: projectId,
      sender: req.user._id,
      recipient: supervisorId,
      message: message || `Project supervision request for "${project.title}"`,
    });

    // Update project state
    project.requestedSupervisor = supervisorId;
    project.supervisorRequestStatus = 'pending';
    project.rejectionReason = '';
    await project.save();

    // Create notification for supervisor
    try {
      await Notification.create({
        recipient: supervisorId,
        sender: req.user._id,
        title: 'New Project Supervision Request',
        message: `${req.user.name} requested you to supervise the academic project "${project.title}".`,
        type: 'supervisor_request',
        link: '/requests',
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.status(201).json({
      success: true,
      request,
      message: 'Supervision request sent successfully to supervisor',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received requests (for supervisor or student)
// @route   GET /api/supervisors/requests
// @access  Private
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await ProjectRequest.find({
      $or: [{ recipient: req.user._id }, { sender: req.user._id }],
    })
      .populate('project', 'title description category status members')
      .populate('sender', 'name email avatar role studentId designation')
      .populate('recipient', 'name email avatar role designation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle request (accept / reject)
// @route   PUT /api/supervisors/requests/:id
// @access  Private
exports.respondToRequest = async (req, res, next) => {
  try {
    const { status, responseNote } = req.body; // 'accepted' | 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await ProjectRequest.findById(req.params.id)
      .populate('project');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Only recipient can accept/reject
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request',
      });
    }

    request.status = status;
    request.responseNote = responseNote || '';
    await request.save();

    const projectId = request.project?._id || request.project;
    const project = await Project.findById(projectId);

    // If accepted:
    if (status === 'accepted') {
      if (project && request.type === 'supervisor_request') {
        project.supervisor = req.user._id;
        project.supervisorRequestStatus = 'accepted';
        project.rejectionReason = '';
        project.status = 'in_progress';
        await project.save();

        // Notify student (request.sender)
        try {
          await Notification.create({
            recipient: request.sender,
            sender: req.user._id,
            title: 'Supervision Request Accepted! 🎉',
            message: `${req.user.name} accepted your request to supervise "${project.title}".`,
            type: 'supervisor_request',
            link: `/projects/${project._id}`,
          });
        } catch (nErr) {
          console.error('Notification error:', nErr);
        }
      } else if (project && request.type === 'join_group') {
        const alreadyMember = project.members.some(
          (m) => m.user.toString() === request.sender.toString()
        );
        if (!alreadyMember) {
          project.members.push({
            user: request.sender,
            role: 'Member',
            joinedAt: new Date(),
          });
          if (project.members.length >= project.maxMembers) {
            project.isLookingForMembers = false;
          }
          await project.save();

          try {
            await Notification.create({
              recipient: request.sender,
              sender: req.user._id,
              title: 'Join Request Accepted',
              message: `You were accepted into the project team for "${project.title}".`,
              type: 'join_request',
              link: `/projects/${project._id}`,
            });
          } catch (nErr) {
            console.error('Notification error:', nErr);
          }
        }
      }
    } else if (status === 'rejected') {
      if (project && request.type === 'supervisor_request') {
        project.supervisor = null;
        project.supervisorRequestStatus = 'rejected';
        project.rejectionReason = responseNote || 'Supervisor was unable to supervise this project at this time.';
        await project.save();

        // Notify student (request.sender)
        try {
          await Notification.create({
            recipient: request.sender,
            sender: req.user._id,
            title: 'Supervision Request Declined ⚠️',
            message: `${req.user.name} was unable to accept your supervision request for "${project.title}". ${responseNote ? `Reason: "${responseNote}"` : ''}`,
            type: 'supervisor_request',
            link: `/projects/${project._id}`,
          });
        } catch (nErr) {
          console.error('Notification error:', nErr);
        }
      } else if (project && request.type === 'join_group') {
        try {
          await Notification.create({
            recipient: request.sender,
            sender: req.user._id,
            title: 'Join Request Declined',
            message: `Your request to join "${project.title}" was declined.`,
            type: 'join_request',
            link: `/projects/${project._id}`,
          });
        } catch (nErr) {
          console.error('Notification error:', nErr);
        }
      }
    }

    res.json({
      success: true,
      message: `Request has been ${status}`,
      request,
    });
  } catch (error) {
    next(error);
  }
};
