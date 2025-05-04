const db = require('../config/db');

const Reservation = {
    async create(userId, NoRoom, Location, Building, Date_in_week, TimeSection, Purpose, NumberOfParticipants, Notes) {
        // Check if the room is available for the given time section
        const [roomStatus] = await db.query(
            `SELECT Status FROM ROOM_STATUS 
             WHERE NoRoom = ? AND Location = ? AND Building = ? 
             AND TimeSection = ? AND Date_in_week = ?`,
            [NoRoom, Location, Building, TimeSection, Date_in_week]
        );

        if (roomStatus.length > 0 && roomStatus[0].Status !== 'available') {
            throw new Error('Room is not available for the selected time section');
        }

        // Create the reservation
        const [result] = await db.query(
            `INSERT INTO RESERVATION 
             (UserID, NoRoom, Location, Building, Date_in_week, TimeSection, Purpose, NumberOfParticipants, Notes, Status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [userId, NoRoom, Location, Building, Date_in_week, TimeSection, Purpose, NumberOfParticipants, Notes]
        );

        // Update room status
        await db.query(
            `UPDATE ROOM_STATUS 
             SET Status = 'occupied' 
             WHERE NoRoom = ? AND Location = ? AND Building = ? 
             AND TimeSection = ? AND Date_in_week = ?`,
            [NoRoom, Location, Building, TimeSection, Date_in_week]
        );

        // Update space room capacity
        await db.query(
            `UPDATE SPACE_ROOM 
             SET Emptys = Emptys - 1, NoEmpty = NoEmpty + 1 
             WHERE NoRoom = ? AND Location = ? AND Building = ?`,
            [NoRoom, Location, Building]
        );

        const [reservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [result.insertId]
        );
        return reservation[0];
    },

    async checkConflict(NoRoom, Location, Building, Date_in_week, TimeSection) {
        const [rows] = await db.query(
            `SELECT * FROM RESERVATION 
             WHERE NoRoom = ? AND Location = ? AND Building = ? 
             AND Date_in_week = ? AND TimeSection = ? 
             AND Status IN ('Pending', 'Confirmed')`,
            [NoRoom, Location, Building, Date_in_week, TimeSection]
        );
        return rows.length > 0;
    },

    async cancel(reservationId, userId) {
        const [reservation] = await db.query(
            `SELECT UserID, NoRoom, Location, Building, Date_in_week, TimeSection, Status 
             FROM RESERVATION 
             WHERE ReservationID = ?`,
            [reservationId]
        );

        if (!reservation[0]) {
            throw new Error('Reservation not found');
        }

        if (reservation[0].UserID !== userId) {
            throw new Error('You do not have permission to cancel this reservation');
        }

        if (reservation[0].Status !== 'Pending' && reservation[0].Status !== 'Confirmed') {
            throw new Error('Only pending or confirmed reservations can be cancelled');
        }

        // Update reservation status
        await db.query(
            `UPDATE RESERVATION 
             SET Status = 'Cancelled' 
             WHERE ReservationID = ?`,
            [reservationId]
        );

        // Update room status
        await db.query(
            `UPDATE ROOM_STATUS 
             SET Status = 'available' 
             WHERE NoRoom = ? AND Location = ? AND Building = ? 
             AND TimeSection = ? AND Date_in_week = ?`,
            [reservation[0].NoRoom, reservation[0].Location, reservation[0].Building, 
             reservation[0].TimeSection, reservation[0].Date_in_week]
        );

        // Update space room capacity
        await db.query(
            `UPDATE SPACE_ROOM 
             SET Emptys = Emptys + 1, NoEmpty = NoEmpty - 1 
             WHERE NoRoom = ? AND Location = ? AND Building = ?`,
            [reservation[0].NoRoom, reservation[0].Location, reservation[0].Building]
        );

        const [updatedReservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [reservationId]
        );
        return updatedReservation[0];
    },

    async findByUser(userId) {
        const [rows] = await db.query(
            `SELECT r.*, sr.TypeRoom 
             FROM RESERVATION r
             JOIN SPACE_ROOM sr ON r.NoRoom = sr.NoRoom 
             AND r.Location = sr.Location 
             AND r.Building = sr.Building
             WHERE r.UserID = ? 
             ORDER BY r.Date_in_week, r.TimeSection ASC`,
            [userId]
        );
        return rows;
    },

    async checkIn(reservationId, userId) {
        const [reservation] = await db.query(
            `SELECT UserID, Status 
             FROM RESERVATION 
             WHERE ReservationID = ?`,
            [reservationId]
        );

        if (!reservation[0]) {
            throw new Error('Reservation not found');
        }

        if (reservation[0].UserID !== userId) {
            throw new Error('You do not have permission to check in to this reservation');
        }

        if (reservation[0].Status !== 'Pending') {
            throw new Error('Only pending reservations can be checked in');
        }

        await db.query(
            `UPDATE RESERVATION 
             SET Status = 'Confirmed' 
             WHERE ReservationID = ?`,
            [reservationId]
        );

        const [updatedReservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [reservationId]
        );
        return updatedReservation[0];
    },

    async checkOut(reservationId, userId) {
        const [reservation] = await db.query(
            `SELECT UserID, Status, NoRoom, Location, Building, Date_in_week, TimeSection 
             FROM RESERVATION 
             WHERE ReservationID = ?`,
            [reservationId]
        );

        if (!reservation[0]) {
            throw new Error('Reservation not found');
        }

        if (reservation[0].UserID !== userId) {
            throw new Error('You do not have permission to check out of this reservation');
        }

        if (reservation[0].Status !== 'Confirmed') {
            throw new Error('Only confirmed reservations can be checked out');
        }

        // Update reservation status
        await db.query(
            `UPDATE RESERVATION 
             SET Status = 'Completed' 
             WHERE ReservationID = ?`,
            [reservationId]
        );

        // Update room status
        await db.query(
            `UPDATE ROOM_STATUS 
             SET Status = 'available' 
             WHERE NoRoom = ? AND Location = ? AND Building = ? 
             AND TimeSection = ? AND Date_in_week = ?`,
            [reservation[0].NoRoom, reservation[0].Location, reservation[0].Building, 
             reservation[0].TimeSection, reservation[0].Date_in_week]
        );

        // Update space room capacity
        await db.query(
            `UPDATE SPACE_ROOM 
             SET Emptys = Emptys + 1, NoEmpty = NoEmpty - 1 
             WHERE NoRoom = ? AND Location = ? AND Building = ?`,
            [reservation[0].NoRoom, reservation[0].Location, reservation[0].Building]
        );

        const [updatedReservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [reservationId]
        );
        return updatedReservation[0];
    },

    async findAll() {
        const [rows] = await db.query(
            `SELECT r.*, u.FullName, sr.TypeRoom 
             FROM RESERVATION r
             JOIN USERS u ON r.UserID = u.UserID
             JOIN SPACE_ROOM sr ON r.NoRoom = sr.NoRoom 
             AND r.Location = sr.Location 
             AND r.Building = sr.Building
             ORDER BY r.Date_in_week, r.TimeSection ASC`
        );
        return rows;
    },

    async updateStatus(reservationId, status) {
        await db.query(
            `UPDATE RESERVATION SET Status = ? WHERE ReservationID = ?`,
            [status, reservationId]
        );
        const [updated] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [reservationId]
        );
        return updated[0];
    }
};

module.exports = Reservation;