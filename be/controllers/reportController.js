const Report = require('../models/reportModel');

const generateReport = async (req, res) => {
  try {
    const { Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report } = req.body;
    const reportId = await Report.generate({ Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report });
    res.status(201).json({ success: true, message: 'Báo cáo đã được tạo', reportId });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo báo cáo', error: error.message });
  }
};

const viewReports = async (req, res) => {
  try {
    const reports = await Report.view();
    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('Error viewing reports:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xem báo cáo', error: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const updateData = req.body;
    const success = await Report.update(reportId, updateData);
    if (success) {
      res.status(200).json({ success: true, message: 'Báo cáo đã được cập nhật' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật báo cáo', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const success = await Report.delete(reportId);
    if (success) {
      res.status(200).json({ success: true, message: 'Báo cáo đã được xóa' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo' });
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa báo cáo', error: error.message });
  }
};

module.exports = {
  generateReport,
  viewReports,
  updateReport,
  deleteReport,
};