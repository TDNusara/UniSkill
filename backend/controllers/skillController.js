const Skill = require('../models/Skill');

// @desc    Get all available skills
// @route   GET /api/skills
// @access  Public
exports.getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suggest / Create a new skill (Student/Supervisor/Admin)
// @route   POST /api/skills
// @access  Private
exports.createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    const existing = await Skill.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists in database',
      });
    }

    const isApproved = req.user.role === 'admin';

    const skill = await Skill.create({
      name: name.trim(),
      category: category || 'Other',
      description: description || '',
      isApproved,
    });

    res.status(201).json({
      success: true,
      skill,
      message: isApproved
        ? 'Skill created successfully'
        : 'Skill submitted for admin approval',
    });
  } catch (error) {
    next(error);
  }
};
