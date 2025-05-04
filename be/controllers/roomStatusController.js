const RoomStatus = require('../models/roomStatusModel');

const roomStatusController = {
  // Get room availability by time section for a specific date
  async getRoomsBySection(req, res) {
    try {
      const { date, section } = req.query;
      
      if (!date || !section) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date and time section are required' 
        });
      }

      // Validate section is between 1 and 5
      const timeSection = parseInt(section);
      if (isNaN(timeSection) || timeSection < 1 || timeSection > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Time section must be between 1 and 5' 
        });
      }

      const rooms = await RoomStatus.getStatusBySection(date, timeSection);
      
      // Map time section to human-readable format
      const timeRanges = {
        1: '7:00 - 8:50',
        2: '9:00 - 10:50',
        3: '11:00 - 12:50',
        4: '13:00 - 14:50',
        5: '15:00 - 16:50'
      };

      res.json({
        success: true,
        timeSection: timeSection,
        timeRange: timeRanges[timeSection],
        date: date,
        rooms: rooms
      });
    } catch (error) {
      console.error('Error fetching rooms by section:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching room status', 
        error: error.message 
      });
    }
  },

  // Get status for all time sections for a specific room on a specific date
  async getRoomStatus(req, res) {
    try {
      const { noRoom, location, building } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date is required' 
        });
      }

      const status = await RoomStatus.getRoomStatusByDate(
        parseInt(noRoom), location, building, date
      );

      // Map time sections to human-readable format
      const timeRanges = {
        1: '7:00 - 8:50',
        2: '9:00 - 10:50',
        3: '11:00 - 12:50',
        4: '13:00 - 14:50',
        5: '15:00 - 16:50'
      };

      const formattedStatus = status.map(s => ({
        ...s,
        timeRange: timeRanges[s.TimeSection]
      }));

      res.json({
        success: true,
        date: date,
        room: {
          noRoom: parseInt(noRoom),
          location,
          building
        },
        timeSlots: formattedStatus
      });
    } catch (error) {
      console.error('Error fetching room status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching room status', 
        error: error.message 
      });
    }
  },

  // Update room status (admin only)
  async updateRoomStatus(req, res) {
    try {
      const { noRoom, location, building } = req.params;
      const { timeSection, date, status } = req.body;

      if (!timeSection || !date || !status) {
        return res.status(400).json({ 
          success: false, 
          message: 'Time section, date, and status are required' 
        });
      }

      // Validate timeSection
      if (timeSection < 1 || timeSection > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Time section must be between 1 and 5' 
        });
      }

      // Validate status
      if (status !== 'available' && status !== 'occupied') {
        return res.status(400).json({ 
          success: false, 
          message: 'Status must be "available" or "occupied"' 
        });
      }

      await RoomStatus.updateStatus(
        parseInt(noRoom), location, building, timeSection, date, status
      );

      res.json({
        success: true,
        message: 'Room status updated successfully'
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating room status', 
        error: error.message 
      });
    }
  },

  // Check if a room is available for specific time sections
  async checkAvailability(req, res) {
    try {
      const { noRoom, location, building } = req.params;
      const { date, timeSections } = req.body;

      if (!date || !timeSections || !Array.isArray(timeSections) || timeSections.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date and time sections array are required' 
        });
      }

      const result = await RoomStatus.checkAvailability(
        parseInt(noRoom), location, building, date, timeSections
      );

      res.json({
        success: true,
        date: date,
        room: {
          noRoom: parseInt(noRoom),
          location,
          building
        },
        available: result.available,
        occupiedSections: result.occupiedSections
      });
    } catch (error) {
      console.error('Error checking room availability:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking room availability', 
        error: error.message 
      });
    }
  }
};

module.exports = roomStatusController; 