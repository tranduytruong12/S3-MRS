const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  register,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getCurrentUser,
  verifyToken,
  changePassword,
  updateProfile,
} = require('../controllers/auth');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

router.use(protect);
router.get('/me', getCurrentUser);
//router.get('/verify-token', verifyToken);
router.put('/change-password', changePassword);
router.put('/profile', updateProfile);

module.exports = router;