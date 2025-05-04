const db = require('../config/db');

class Equipment {
    // Lấy tất cả thiết bị
    static async findAll() {
        try {
            const query = 'SELECT MTB, Name, Amount, Status FROM EQUIPMENT';
            console.log('Executing query:', query);
            const [rows] = await db.query(query);
            console.log('Query result:', rows);
            return rows;
        } catch (error) {
            console.error('Database error in Equipment.findAll:', error);
            throw error;
        }
    }

    // Tìm thiết bị theo ID
    static async findByPk(id) {
        try {
            const query = 'SELECT * FROM EQUIPMENT WHERE MTB = ?';
            const [rows] = await db.query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Database error in Equipment.findByPk:', error);
            throw error;
        }
    }

    // Tạo thiết bị mới
    static async create({ Name, Amount, Status }) {
        try {
            // Lấy MTB lớn nhất và tăng lên 1
            const [maxResult] = await db.query('SELECT MAX(MTB) as maxMTB FROM EQUIPMENT');
            const newMTB = maxResult[0].maxMTB ? maxResult[0].maxMTB + 1 : 500;

            const query = 'INSERT INTO EQUIPMENT (MTB, Name, Amount, Status) VALUES (?, ?, ?, ?)';
            await db.query(query, [newMTB, Name, Amount, Status || 'Sẵn sàng']);
            
            return { MTB: newMTB, Name, Amount, Status: Status || 'Sẵn sàng' };
        } catch (error) {
            console.error('Database error in Equipment.create:', error);
            throw error;
        }
    }

    // Cập nhật thiết bị
    static async update(id, Status) {
        try {
            const query = 'UPDATE EQUIPMENT SET Status = ? WHERE MTB = ?';
            const [result] = await db.query(query, [Status, id]);
            return result.affectedRows;
        } catch (error) {
            console.error('Database error in Equipment.update:', error);
            throw error;
        }
    }

    // Xóa thiết bị
    static async delete(id) {
        try {
            const query = 'DELETE FROM EQUIPMENT WHERE MTB = ?';
            const [result] = await db.query(query, [id]);
            return result.affectedRows;
        } catch (error) {
            console.error('Database error in Equipment.delete:', error);
            throw error;
        }
    }

    // Mượn thiết bị
    static async borrow(equipmentId, studentId) {
        try {
            const [equipment] = await db.query(
                `SELECT Status FROM EQUIPMENT WHERE MTB = ?`,
                [equipmentId]
            );

            if (!equipment[0]) {
                throw new Error('Không tìm thấy thiết bị');
            }
            if (equipment[0].Status !== 'Sẵn sàng') {
                throw new Error('Thiết bị không sẵn sàng để mượn');
            }

            const [result] = await db.query(
                `UPDATE EQUIPMENT 
                SET Status = ? 
                WHERE MTB = ?`,
                ['Đang sử dụng', equipmentId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Không thể cập nhật thiết bị');
            }

            return await Equipment.findByPk(equipmentId);
        } catch (error) {
            console.error('Database error in Equipment.borrow:', error);
            throw error;
        }
    }

    // Trả thiết bị
    static async return(equipmentId, studentId) {
        try {
            const [equipment] = await db.query(
                `SELECT Status FROM EQUIPMENT WHERE MTB = ?`,
                [equipmentId]
            );

            if (!equipment[0]) {
                throw new Error('Không tìm thấy thiết bị');
            }
            if (equipment[0].Status !== 'Đang sử dụng') {
                throw new Error('Thiết bị không đang được mượn');
            }

            const [result] = await db.query(
                `UPDATE EQUIPMENT 
                SET Status = ? 
                WHERE MTB = ?`,
                ['Sẵn sàng', equipmentId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Không thể cập nhật thiết bị');
            }

            return await Equipment.findByPk(equipmentId);
        } catch (error) {
            console.error('Database error in Equipment.return:', error);
            throw error;
        }
    }

    // Get equipment status report
    static async getStatusReport() {
        try {
            const query = `
                SELECT 
                    Status, 
                    COUNT(*) as count
                FROM 
                    EQUIPMENT 
                GROUP BY 
                    Status
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Database error in Equipment.getStatusReport:', error);
            throw error;
        }
    }
};

module.exports = Equipment;