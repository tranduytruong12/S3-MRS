const db = require('../config/db');

const RoomStatus = {
  // Get status for all rooms for a specific date and time section
  async getStatusBySection(date, timeSection) {
    try {
      console.log(`Getting room status for date: ${date}, section: ${timeSection}`);
      
      // Validate inputs to prevent database errors
      if (!date || !timeSection) {
        console.error('Missing required parameters for getStatusBySection');
        return [];
      }
      
      // Normalize date to lowercase
      const normalizedDate = date.toLowerCase();
      
      // Validate date is a valid day of week
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      if (!validDays.includes(normalizedDate)) {
        console.error(`Invalid day of week: ${normalizedDate}`);
        return [];
      }
      
      // Validate time section is a number between 1-5
      const sectionNum = parseInt(timeSection);
      if (isNaN(sectionNum) || sectionNum < 1 || sectionNum > 5) {
        console.error(`Invalid time section: ${timeSection}`);
        return [];
      }
      
      const result = await db.query(
        'CALL Get_Room_Availability_By_Section(?, ?)', 
        [normalizedDate, sectionNum]
      );
      
      // Log results for debugging
      console.log(`Found ${result[0]?.length || 0} rooms for ${date}, section ${timeSection}`);
      
      return result[0] || [];
    } catch (error) {
      console.error('Error getting room status by section:', error);
      throw new Error(`Error getting room status: ${error.message}`);
    }
  },

  // Get all time sections status for a specific room on a specific date
  async getRoomStatusByDate(noRoom, location, building, date) {
    try {
      const [rows] = await db.query(
        `SELECT NoRoom, Location, Building, TimeSection, Status, Date_in_week
         FROM ROOM_STATUS
         WHERE NoRoom = ? AND Location = ? AND Building = ? AND Date_in_week = ?
         ORDER BY TimeSection`,
        [noRoom, location, building, date]
      );
      
      // If no results for some time sections, include defaults (available)
      const result = [];
      for (let section = 1; section <= 5; section++) {
        const existingStatus = rows.find(row => row.TimeSection === section);
        if (existingStatus) {
          result.push(existingStatus);
        } else {
          result.push({
            NoRoom: noRoom,
            Location: location,
            Building: building,
            TimeSection: section,
            Status: 'available',
            Date_in_week: date
          });
        }
      }
      return result;
    } catch (error) {
      console.error('Error getting room status by date:', error);
      throw new Error(`Error getting room status: ${error.message}`);
    }
  },

  // Update room status
  async updateStatus(noRoom, location, building, timeSection, date, status) {
    try {
      // Check if the status entry exists
      const [existing] = await db.query(
        `SELECT StatusID 
         FROM ROOM_STATUS 
         WHERE NoRoom = ? AND Location = ? AND Building = ? AND TimeSection = ? AND Date_in_week = ?`,
        [noRoom, location, building, timeSection, date]
      );

      if (existing.length > 0) {
        // Update existing status
        await db.query(
          `UPDATE ROOM_STATUS 
           SET Status = ? 
           WHERE NoRoom = ? AND Location = ? AND Building = ? AND TimeSection = ? AND Date_in_week = ?`,
          [status, noRoom, location, building, timeSection, date]
        );
      } else {
        // Insert new status
        await db.query(
          `INSERT INTO ROOM_STATUS (NoRoom, Location, Building, TimeSection, Status, Date_in_week)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [noRoom, location, building, timeSection, status, date]
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating room status:', error);
      throw new Error(`Error updating room status: ${error.message}`);
    }
  },

  // Check if a room is available for specific time sections on a specific date
  async checkAvailability(noRoom, location, building, date, timeSections) {
    try {
      // Query for status of specified time sections
      const sectionPlaceholders = timeSections.map(() => '?').join(',');
      const [rows] = await db.query(
        `SELECT TimeSection, Status
         FROM ROOM_STATUS
         WHERE NoRoom = ? AND Location = ? AND Building = ? AND Date_in_week = ? AND TimeSection IN (${sectionPlaceholders})
         AND Status = 'occupied'`,
        [noRoom, location, building, date, ...timeSections]
      );

      // If any time section is occupied, the room is not available
      return {
        available: rows.length === 0,
        occupiedSections: rows.map(row => row.TimeSection)
      };
    } catch (error) {
      console.error('Error checking room availability:', error);
      throw new Error(`Error checking room availability: ${error.message}`);
    }
  },

  // Update room status when a reservation is made
  async updateForReservation(noRoom, location, building, startTime, endTime, status = 'occupied') {
    try {
      // Get day of week in lowercase
      const date = new Date(startTime);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Calculate which time section the booking falls into
      const startHour = new Date(startTime).getHours();
      const endHour = new Date(endTime).getHours();
      
      const startSection = this._getTimeSection(startHour);
      const endSection = this._getTimeSection(endHour);
      
      // Update all affected time sections
      for (let section = startSection; section <= endSection; section++) {
        await this.updateStatus(noRoom, location, building, section, dayOfWeek, status);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating room status for reservation:', error);
      throw new Error(`Error updating room status: ${error.message}`);
    }
  },

  // Helper method to convert hour to time section
  _getTimeSection(hour) {
    if (hour < 9) return 1; // 7:00-8:50
    if (hour < 11) return 2; // 9:00-10:50
    if (hour < 13) return 3; // 11:00-12:50
    if (hour < 15) return 4; // 13:00-14:50
    return 5; // 15:00-16:50
  }
};

module.exports = RoomStatus; 