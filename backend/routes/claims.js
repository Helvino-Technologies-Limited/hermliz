const express = require('express');
const router = express.Router();
const { getClaims, getClaim, createClaim, updateClaim } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getClaims);
router.post('/', createClaim);
router.get('/:id', getClaim);
router.put('/:id', updateClaim);

module.exports = router;
