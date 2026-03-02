const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', protect, dashboardController.getStats);
router.get('/revenue', protect, dashboardController.getRevenueChart);
router.get('/underwriters', protect, dashboardController.getUnderwriterBreakdown);

module.exports = router;
