const express = require('express');
const router = express.Router();
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const { generateReport, viewReports, updateReport, deleteReport } = require('../controllers/reportController');

router.use(protect);

router.post('/generate', adminOnly, generateReport); // Chỉ admin có thể tạo báo cáo
router.get('/view', adminOnly, viewReports); // Chỉ admin có thể xem danh sách báo cáo
router.put('/update/:id', adminOnly, updateReport); // Chỉ admin có thể cập nhật báo cáo
router.delete('/delete/:id', adminOnly, deleteReport); // Chỉ admin có thể xóa báo cáo

module.exports = router;