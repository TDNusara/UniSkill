const express = require('express');
const router = express.Router();
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getSkills);
router.post('/', protect, createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

module.exports = router;
