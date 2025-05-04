const Room = require('../models/spaceModel');

const roomController = {
    async getAllRooms(req, res) {
        try {
            const rooms = await Room.findAll();
            res.json(rooms);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching rooms', error: error.message });
        }
    },

    async getRoomById(req, res) {
        try {
            const room = await Room.findById(req.params.noRoom);
            console.log(room);
            if (!room) return res.status(404).json({ message: 'Room not found' });
            res.json(room);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching room', error: error.message });
        }
    }
};

module.exports = roomController;