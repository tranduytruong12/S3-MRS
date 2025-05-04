const express = require('express');
const router = express.Router();
const roomStatusController = require('../controllers/roomStatusController');
const { protect, adminOnly } = require('../middleware/auth');

// Get all rooms with their status for a specific time section and date
router.get('/', roomStatusController.getRoomsBySection);

// Get status of a specific room for all time sections on a specific date
router.get('/:noRoom/:location/:building', roomStatusController.getRoomStatus);

// Update room status (admin only)
router.put('/:noRoom/:location/:building', protect, adminOnly, roomStatusController.updateRoomStatus);

// Check if a room is available for specific time sections
router.post('/:noRoom/:location/:building/check', protect, roomStatusController.checkAvailability);

module.exports = router; 