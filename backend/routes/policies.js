const express = require('express');
const router = express.Router();
const { getPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy, renewPolicy, getExpiringPolicies, updateRenewalStatus } = require('../controllers/policyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getPolicies);
router.post('/', createPolicy);
router.get('/expiring', getExpiringPolicies);
router.get('/:id', getPolicy);
router.put('/:id', updatePolicy);
router.delete('/:id', deletePolicy);
router.post('/:id/renew', renewPolicy);
router.put('/:id/renewal-status', updateRenewalStatus);

module.exports = router;
