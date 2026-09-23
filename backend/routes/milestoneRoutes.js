const express = require('express');
const router = express.Router();
const {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  submitMilestone,
  reviewMilestone,
  toggleTaskStatus,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:projectId', getProjectMilestones);
router.post('/', protect, createMilestone);
router.put('/:id', protect, updateMilestone);
router.post('/:id/submit', protect, submitMilestone);
router.post('/:id/review', protect, reviewMilestone);
router.patch('/:id/task/:taskId', protect, toggleTaskStatus);

module.exports = router;
