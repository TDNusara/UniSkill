const User = require('../models/User');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Department = require('../models/Department');

// @desc    Get Admin system analytics & summary statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSupervisors = await User.countDocuments({ role: 'supervisor' });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'in_progress' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const totalSkills = await Skill.countDocuments();
    const totalDepartments = await Department.countDocuments();

    // Projects by category breakdown
    const categoryStats = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Top skills in demand
    const skillsAggregation = await Project.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skillInfo',
        },
      },
      { $unwind: '$skillInfo' },
      { $project: { name: '$skillInfo.name', category: '$skillInfo.category', count: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalSupervisors,
        totalProjects,
        activeProjects,
        completedProjects,
        totalSkills,
        totalDepartments,
        categoryStats,
        topSkills: skillsAggregation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filter & search
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { role, department, search, isActive } = req.query;
    let query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Suspend)
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'suspended'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage departments (CRUD)
// @route   GET /api/admin/departments & POST /api/admin/departments
// @access  Public / Admin
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
    });

    res.status(201).json({ success: true, department, message: 'Department created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department removed successfully' });
  } catch (error) {
    next(error);
  }
};
