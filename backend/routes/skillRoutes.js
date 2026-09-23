const express = require('express');
const router = express.Router();
const { getSkills, createSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSkills);
router.post('/', protect, createSkill);

module.exports = router;
