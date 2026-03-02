const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);
router.get('/users', protect, authController.getUsers);
router.post('/users', protect, authController.createUser);
router.put('/users/:id', protect, authController.updateUser);
router.delete('/users/:id', protect, authController.deleteUser);

module.exports = router;
