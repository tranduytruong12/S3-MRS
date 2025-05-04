const Reservation = require('../models/bookingModel');

const reservationController = {
    // Create a new reservation
    async createReservation(req, res) {
        try {
            const { userId, NoRoom, Location, Building, StartTime, EndTime } = req.body;
            
            // Validate required fields
            if (!userId || !NoRoom || !Location || !Building || !StartTime || !EndTime) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Check for time conflicts
            const hasConflict = await Reservation.checkConflict(NoRoom, StartTime, EndTime);
            if (hasConflict) {
                return res.status(400).json({ error: 'Time slot conflict with existing reservation' });
            }

            const reservation = await Reservation.create(userId, NoRoom, Location, Building, StartTime, EndTime);
            res.status(201).json(reservation);
        } catch (error) {
            console.error('Error creating reservation:', error);
            res.status(500).json({ error: 'Failed to create reservation' });
        }
    },

    // Get all reservations for a user
    async getUserReservations(req, res) {
        try {
            const { userId } = req.params;
            const reservations = await Reservation.findByUser(userId);
            res.json(reservations);
        } catch (error) {
            console.error('Error fetching user reservations:', error);
            res.status(500).json({ error: 'Failed to fetch reservations' });
        }
    },

    // Cancel a reservation
    async cancelReservation(req, res) {
        try {
            const { reservationId } = req.params;
            const { userId } = req.body;

            const reservation = await Reservation.cancel(reservationId, userId);
            res.json(reservation);
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            res.status(500).json({ error: error.message || 'Failed to cancel reservation' });
        }
    },

    // Check in to a reservation
    async checkIn(req, res) {
        try {
            const { reservationId } = req.params;
            const { userId } = req.body;

            const reservation = await Reservation.checkIn(reservationId, userId);
            res.json(reservation);
        } catch (error) {
            console.error('Error checking in:', error);
            res.status(500).json({ error: error.message || 'Failed to check in' });
        }
    },

    // Check out from a reservation
    async checkOut(req, res) {
        try {
            const { reservationId } = req.params;
            const { userId } = req.body;

            const reservation = await Reservation.checkOut(reservationId, userId);
            res.json(reservation);
        } catch (error) {
            console.error('Error checking out:', error);
            res.status(500).json({ error: error.message || 'Failed to check out' });
        }
    },

    // Get all reservations (admin)
    async getAllReservations(req, res) {
        try {
            const reservations = await Reservation.findAll();
            res.json(reservations);
        } catch (error) {
            console.error('Error fetching all reservations:', error);
            res.status(500).json({ error: 'Failed to fetch all reservations' });
        }
    },

    // Update reservation status (admin)
    async updateReservationStatus(req, res) {
        try {
            const { reservationId } = req.params;
            const { status } = req.body;
            if (!['Confirmed', 'Cancelled'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            const updated = await Reservation.updateStatus(reservationId, status);
            res.json(updated);
        } catch (error) {
            console.error('Error updating reservation status:', error);
            res.status(500).json({ error: 'Failed to update reservation status' });
        }
    }
};

module.exports = reservationController; 