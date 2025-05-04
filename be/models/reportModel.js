const db = require('../config/db');

const Report = {
  generate: async (reportData) => {
    const { Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report } = reportData;
    try {
        // Tìm max STT hiện tại
        const [maxResult] = await db.query('SELECT MAX(STT) AS maxId FROM REPORT');
        const reportId = (maxResult[0].maxId || 0) + 1;

      const [result] = await db.query(
        'INSERT INTO REPORT (STT, Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report) VALUES (?, ?, ?, ?, ?, ?)',
        [reportId, Report_Date, Content, Date_Sent, Amount, MSNV_Staff_Report]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error generating report: ${error.message}`);
    }
  },

  view: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM REPORT');
      return rows;
    } catch (error) {
      throw new Error(`Error viewing reports: ${error.message}`);
    }
  },

  update: async (id, updateData) => {
    try {
      const updateFields = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updateData);

      await db.query(`UPDATE REPORT SET ${updateFields} WHERE STT = ?`, [...values, id]);
      return true;
    } catch (error) {
      throw new Error(`Error updating report: ${error.message}`);
    }
  },

  delete: async (id) => {
    try {
      await db.query('DELETE FROM REPORT WHERE STT = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting report: ${error.message}`);
    }
  },
};

module.exports = Report;