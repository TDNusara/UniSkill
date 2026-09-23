const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  getDepartments,
  createDepartment,
  deleteDepartment,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.delete('/departments/:id', deleteDepartment);

module.exports = router;
