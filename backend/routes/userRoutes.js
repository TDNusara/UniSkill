const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updateStudentSkills,
  getPublicPortfolio,
  getStudentsDirectory,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.put('/skills', protect, updateStudentSkills);
router.get('/portfolio/:id', getPublicPortfolio);
router.get('/students', protect, getStudentsDirectory);

module.exports = router;
