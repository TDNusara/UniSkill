const express = require('express');
const router = express.Router();
const {
  getSupervisors,
  requestSupervision,
  getMyRequests,
  respondToRequest,
} = require('../controllers/supervisorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSupervisors);
router.post('/request', protect, requestSupervision);
router.get('/requests', protect, getMyRequests);
router.put('/requests/:id', protect, respondToRequest);

module.exports = router;
