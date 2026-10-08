const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      avatar,
      bio,
      phone,
      department,
      degree,
      studentId,
      batchYear,
      education,
      socialLinks,
      designation,
      researchInterests,
      officeLocation,
      maxSupervisionCapacity,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department || null;

    if (user.role === 'student') {
      if (degree !== undefined) user.degree = degree;
      if (studentId !== undefined) user.studentId = studentId;
      if (batchYear !== undefined) user.batchYear = batchYear;
      if (education !== undefined) user.education = education;
      if (socialLinks !== undefined) user.socialLinks = socialLinks;
    }

    if (user.role === 'supervisor') {
      if (designation !== undefined) user.designation = designation;
      if (researchInterests !== undefined) user.researchInterests = researchInterests;
      if (officeLocation !== undefined) user.officeLocation = officeLocation;
      if (maxSupervisionCapacity !== undefined) user.maxSupervisionCapacity = maxSupervisionCapacity;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('department', 'name code degrees')
      .populate('skills.skill');

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / Update student skills
// @route   PUT /api/users/skills
// @access  Private (Student)
exports.updateStudentSkills = async (req, res, next) => {
  try {
    const { skills } = req.body; // Array of { skill: ObjectId, level: String }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.skills = skills;
    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .populate('skills.skill');

    res.json({
      success: true,
      skills: updatedUser.skills,
      message: 'Skills updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public portfolio of a student by ID
// @route   GET /api/users/portfolio/:id
// @access  Public
exports.getPublicPortfolio = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('skills.skill');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student portfolio not found',
      });
    }

    // Fetch student's projects (completed and active)
    const projects = await Project.find({
      'members.user': student._id,
      status: { $in: ['in_progress', 'completed'] },
    })
      .populate('requiredSkills', 'name category')
      .populate('supervisor', 'name designation')
      .populate('members.user', 'name avatar role');

    res.json({
      success: true,
      student,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students directory (for finding teammates)
// @route   GET /api/users/students
// @access  Private
exports.getStudentsDirectory = async (req, res, next) => {
  try {
    const { skill, department, search } = req.query;
    let query = { role: 'student', isActive: true };

    if (department) {
      query.department = department;
    }

    if (skill) {
      query['skills.skill'] = skill;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .populate('skills.skill');

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};
