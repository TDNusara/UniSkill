const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendOtpEmail } = require('../utils/sendEmail');

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
    const { email, password, portal } = req.body;
    const identifier = (email || req.body.username || req.body.identifier || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password',
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { studentId: identifier },
      ],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    // Portal role validation if specified
    if (portal === 'student' && user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Staff and Administrators must sign in through the Staff & Faculty Portal.',
      });
    }

    if (portal === 'staff' && user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students must sign in through the Student Portal.',
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

// Helper to mask email for security
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

// @desc    Forgot Password - generate 6-digit OTP and send to registered email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const identifier = (email || req.body.username || '').trim();

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered university email or Student ID',
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { studentId: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No active account found for the provided identifier.',
      });
    }

    // Generate 6-digit OTP
    const otp = user.generateResetOtp();
    await user.save({ validateBeforeSave: false });

    const masked = maskEmail(user.email);

    // In terminal console, log the security OTP for development testing
    console.log(`\n======================================================`);
    console.log(`🔒 [SECURITY OTP] Password Reset Verification Code`);
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🔢 6-Digit OTP Code: >>> ${otp} <<<`);
    console.log(`⏱️  Valid for: 10 minutes`);
    console.log(`======================================================\n`);

    // Send OTP email via Nodemailer
    await sendOtpEmail({
      to: user.email,
      userName: user.name,
      otp,
    });

    res.json({
      success: true,
      message: `A secure 6-digit verification code has been sent to your registered email (${masked}).`,
      email: user.email,
      maskedEmail: masked,
      // For local development demonstration convenience:
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 6-digit OTP & generate temporary reset session token
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your registered email and the 6-digit OTP code',
      });
    }

    // Sanitize OTP input (strip whitespace, hyphens, and non-digits)
    const cleanOtp = String(otp).replace(/\D/g, '').trim();

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Verification code must be exactly 6 digits',
      });
    }

    // Hash user-provided OTP
    const hashedOtp = crypto
      .createHash('sha256')
      .update(cleanOtp)
      .digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 6-digit verification code. Please try again.',
      });
    }

    // Clear OTP and create a short-lived reset token
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Verification successful. You may now set your new password.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using verified session token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash token from param
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset session has expired or is invalid. Please request a new verification code.',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in.',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

