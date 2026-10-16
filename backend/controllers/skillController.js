const Skill = require('../models/Skill');

// @desc    Get all available skills (with department & degree filter)
// @route   GET /api/skills
// @access  Public
exports.getSkills = async (req, res, next) => {
  try {
    const { category, search, department, degree, includeGeneral } = req.query;
    let query = { isApproved: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Department filtering
    if (department && department !== 'all') {
      if (department === 'general') {
        // Universal / cross-department skills only
        query.department = null;
      } else {
        const shouldIncludeGeneral = includeGeneral !== 'false';

        if (degree && degree !== 'all') {
          // Degree-specific filtering
          const degreeConditions = [
            { degree: degree },
            { degree: '' },
            { degree: null },
            { degree: 'All' },
            { degree: { $exists: false } },
          ];

          if (shouldIncludeGeneral) {
            query.$or = [
              { department: null },
              {
                department: department,
                $or: degreeConditions,
              },
            ];
          } else {
            query.department = department;
            query.$or = degreeConditions;
          }
        } else {
          // Department-wide filtering
          if (shouldIncludeGeneral) {
            query.$or = [{ department: department }, { department: null }];
          } else {
            query.department = department;
          }
        }
      }
    }

    const skills = await Skill.find(query)
      .populate('department', 'name code degrees')
      .sort({ category: 1, name: 1 });

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
    const { name, category, description, department, degree } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required',
      });
    }

    const deptValue = department && department !== 'null' && department !== '' ? department : null;
    const degreeValue = degree && degree !== 'all' ? degree.trim() : '';

    // Check duplicate under same department and degree
    const existing = await Skill.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      department: deptValue,
      degree: degreeValue,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This skill already exists for the selected department and degree program',
      });
    }

    const isApproved = req.user.role === 'admin';

    const skill = await Skill.create({
      name: name.trim(),
      category: category ? category.trim() : 'General',
      department: deptValue,
      degree: degreeValue,
      description: description ? description.trim() : '',
      isApproved,
    });

    const populatedSkill = await Skill.findById(skill._id).populate('department', 'name code degrees');

    res.status(201).json({
      success: true,
      skill: populatedSkill,
      message: isApproved
        ? 'Skill created and added to academic catalog'
        : 'Skill submitted to administrator for approval',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a skill (Admin)
// @route   PUT /api/skills/:id
// @access  Private (Admin)
exports.updateSkill = async (req, res, next) => {
  try {
    const { name, category, description, department, degree, isApproved } = req.body;

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    if (name) skill.name = name.trim();
    if (category) skill.category = category.trim();
    if (description !== undefined) skill.description = description.trim();
    if (department !== undefined) {
      skill.department = department && department !== 'null' && department !== '' ? department : null;
    }
    if (degree !== undefined) {
      skill.degree = degree && degree !== 'all' ? degree.trim() : '';
    }
    if (isApproved !== undefined) {
      skill.isApproved = isApproved;
    }

    await skill.save();

    const populatedSkill = await Skill.findById(skill._id).populate('department', 'name code degrees');

    res.json({
      success: true,
      skill: populatedSkill,
      message: 'Skill updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill (Admin)
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.json({
      success: true,
      message: 'Skill removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
