const express = require('express');
const router = express.Router();
const { getInstallments, recordPayment, getDueToday, getOverdue } = require('../controllers/installmentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getInstallments);
router.get('/due-today', getDueToday);
router.get('/overdue', getOverdue);
router.post('/:id/payment', recordPayment);

module.exports = router;
