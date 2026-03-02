const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile, changePassword, getUsers, createUser, updateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.get('/users', protect, authorize('super_admin', 'broker_admin'), getUsers);
router.post('/users', protect, authorize('super_admin', 'broker_admin'), createUser);
router.put('/users/:id', protect, authorize('super_admin', 'broker_admin'), updateUser);
router.delete('/users/:id', protect, authorize('super_admin', 'broker_admin'), deleteUser);

module.exports = router;
