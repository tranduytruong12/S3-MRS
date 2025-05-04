const pool = require('../config/db');

const Notification = {
    /**
     * Create a notification
     * @param {string} statistical - Title or statistical information for the notification
     * @param {string} content - Content of the notification
     * @param {number} userId - UserID of the receiver
     * @returns {Promise} - Result of the operation
     */
    async create(statistical, content, userId) {
        try {
            // First try to get MSSV for this UserID
            const [student] = await pool.query(
                'SELECT MSSV FROM STUDENT WHERE UserID = ?',
                [userId]
            );
            
            // If this is a student, use their MSSV
            if (student.length > 0) {
                const [result] = await pool.query(
                    `INSERT INTO NOTIFICATION (STT, Statistical, Content, Date_s, Read_s, News, MSSV_Notification) 
                     VALUES ((SELECT COALESCE(MAX(STT), 0) + 1 FROM NOTIFICATION n2), ?, ?, CURDATE(), 'F', 'T', ?)`,
                    [statistical, content, student[0].MSSV]
                );
                return result;
            } else {
                // Try to see if this is an admin
                const [admin] = await pool.query(
                    'SELECT MSNV_Admin FROM ADMIN WHERE UserID = ?',
                    [userId]
                );
                
                if (admin.length > 0) {
                    const [result] = await pool.query(
                        `INSERT INTO NOTIFICATION (STT, Statistical, Content, Date_s, Read_s, News, MSNV_Admin_Notification) 
                         VALUES ((SELECT COALESCE(MAX(STT), 0) + 1 FROM NOTIFICATION n2), ?, ?, CURDATE(), 'F', 'T', ?)`,
                        [statistical, content, admin[0].MSNV_Admin]
                    );
                    return result;
                } else {
                    // This user is neither a student nor an admin, can't create notification
                    console.log(`Cannot create notification: User ${userId} is neither a student nor an admin`);
                    return null;
                }
            }
        } catch (error) {
            console.error('Error creating notification:', error);
            // Don't throw error, just return null - ensures booking process continues
            return null;
        }
    }
};

module.exports = Notification;