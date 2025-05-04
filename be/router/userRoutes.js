const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

router.use(protect);

router.get('/', adminOnly, getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;