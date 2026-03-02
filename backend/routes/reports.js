const express = require('express');
const router = express.Router();
const { getPolicyRegister, getCommissionReport, getDebtReport, getAgingReport, getRenewalForecast, getIncomeReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/policies', getPolicyRegister);
router.get('/commissions', getCommissionReport);
router.get('/debts', getDebtReport);
router.get('/aging', getAgingReport);
router.get('/renewals', getRenewalForecast);
router.get('/income', getIncomeReport);

module.exports = router;
