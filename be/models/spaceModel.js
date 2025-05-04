const pool = require('../config/db');

const Room = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM SPACE_ROOM');
        return rows;
    },

    async findById(roomId) {
        const [rows] = await pool.query('SELECT * FROM SPACE_ROOM WHERE NoRoom = ?', [roomId]);
        return rows[0];
    }
    
};

module.exports = Room;