const express = require('express');
const router = express.Router();
const { getDashboard, getRevenueChart, getUnderwriterBreakdown } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getDashboard);
router.get('/revenue-chart', getRevenueChart);
router.get('/underwriter-breakdown', getUnderwriterBreakdown);

module.exports = router;
