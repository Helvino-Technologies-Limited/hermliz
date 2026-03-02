const express = require('express');
const router = express.Router();
const { getUnderwriters, getUnderwriter, createUnderwriter, updateUnderwriter, deleteUnderwriter, getUnderwriterStats } = require('../controllers/underwriterController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getUnderwriters);
router.post('/', authorize('super_admin', 'broker_admin'), createUnderwriter);
router.get('/:id', getUnderwriter);
router.put('/:id', authorize('super_admin', 'broker_admin'), updateUnderwriter);
router.delete('/:id', authorize('super_admin', 'broker_admin'), deleteUnderwriter);
router.get('/:id/stats', getUnderwriterStats);

module.exports = router;
