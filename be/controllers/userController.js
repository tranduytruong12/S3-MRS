const { User } = require('../models/userModel');
const { validationResult } = require('express-validator');

const getUsers = async (req, res) => {
  try {
    const userRole = await User.getRole(req.user.UserID);
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = await User.getRole(req.user.UserID);

    if (userRole !== 'admin' && req.user.UserID !== parseInt(userId)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const userRole = await User.getRole(req.user.UserID);

    if (userRole !== 'admin' && req.user.UserID !== parseInt(userId)) {
      return res.status(403).json({ message: 'Không có quyền cập nhật thông tin này' });
    }

    const { FullName, Email, Password, PhoneNumber, DateOfBirth, Sex } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const updatedUser = await User.update(userId, {
      FullName,
      Email,
      Password,
      PhoneNumber,
      DateOfBirth,
      Sex,
    });

    if (!updatedUser) {
      return res.status(400).json({ message: 'Không có thông tin nào được cập nhật' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userRole = await User.getRole(req.user.UserID);
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa người dùng' });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await User.delete(userId);

    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};