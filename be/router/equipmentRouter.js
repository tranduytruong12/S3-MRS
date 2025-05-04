const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { validateEquipment } = require('../middleware/auth');
const { protect, adminOnly, staffOnly, studentOnly } = require('../middleware/auth');

// Public route: Lấy tất cả thiết bị (không cần đăng nhập)
router.get('/public', equipmentController.getAllEquipments);

// Lấy tất cả thiết bị (mọi người dùng đã đăng nhập)
router.get('/', protect, equipmentController.getAllEquipments);

// Lấy báo cáo trạng thái thiết bị (chỉ admin)
router.get('/report', protect, adminOnly, equipmentController.getEquipmentStatusReport);

// Lấy thông tin 1 thiết bị (mọi người dùng đã đăng nhập)
router.get('/:id', protect, equipmentController.getEquipmentById);

// Tạo thiết bị mới (chỉ admin hoặc staff)
router.post('/', protect, staffOnly, validateEquipment, equipmentController.createEquipment);

// Cập nhật trạng thái thiết bị (chỉ admin hoặc staff)
router.put('/:id', protect, staffOnly, equipmentController.updateEquipment);

// Xóa thiết bị (chỉ admin)
router.delete('/:id', protect, adminOnly, equipmentController.deleteEquipment);

// Mượn thiết bị (chỉ sinh viên)
router.post('/:id/borrow', protect, studentOnly, equipmentController.borrowEquipment);

// Trả thiết bị (chỉ sinh viên)
router.post('/:id/return', protect, studentOnly, equipmentController.returnEquipment);
module.exports = router;