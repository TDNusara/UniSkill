const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  getDepartments,
  createDepartment,
  updateDepartment,
  addDegreeToDepartment,
  deleteDegreeFromDepartment,
  deleteDepartment,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: fetch departments list (needed for registration & public filters)
router.get('/departments', getDepartments);

// Admin-protected routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.post('/departments/:id/degrees', addDegreeToDepartment);
router.delete('/departments/:id/degrees/:degreeId', deleteDegreeFromDepartment);
router.delete('/departments/:id', deleteDepartment);

module.exports = router;
