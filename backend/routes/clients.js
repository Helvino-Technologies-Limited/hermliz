const express = require('express');
const router = express.Router();
const { getClients, getClient, createClient, updateClient, deleteClient, searchByVehicle, getClientStats } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getClients);
router.post('/', createClient);
router.get('/search/vehicle/:reg', searchByVehicle);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.get('/:id/stats', getClientStats);

module.exports = router;
