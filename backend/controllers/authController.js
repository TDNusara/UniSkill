const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (student or supervisor)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, studentId, batchYear, designation } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Role safety: normal registration cannot create admin
    const assignedRole = role === 'admin' ? 'student' : role || 'student';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || null,
      studentId: assignedRole === 'student' ? studentId : undefined,
      batchYear: assignedRole === 'student' ? batchYear : undefined,
      designation: assignedRole === 'supervisor' ? designation : undefined,
    });

    const populatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('skills.skill');

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        avatar: populatedUser.avatar,
        department: populatedUser.department,
        studentId: populatedUser.studentId,
        batchYear: populatedUser.batchYear,
        designation: populatedUser.designation,
        skills: populatedUser.skills,
        bio: populatedUser.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    const populatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('skills.skill');

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        avatar: populatedUser.avatar,
        department: populatedUser.department,
        studentId: populatedUser.studentId,
        batchYear: populatedUser.batchYear,
        designation: populatedUser.designation,
        skills: populatedUser.skills,
        bio: populatedUser.bio,
        phone: populatedUser.phone,
        socialLinks: populatedUser.socialLinks,
        researchInterests: populatedUser.researchInterests,
        education: populatedUser.education,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name code')
      .populate('skills.skill');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Mock / Reset)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user registered with this email',
      });
    }

    // In local dev/mock mode, we return success with instructions
    res.json({
      success: true,
      message: 'Password reset instructions have been dispatched to your email address (Simulated).',
    });
  } catch (error) {
    next(error);
  }
};
