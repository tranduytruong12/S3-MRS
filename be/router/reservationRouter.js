const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Create a new reservation
router.post('/', reservationController.createReservation);

// Get all reservations for admin
router.get('/all', reservationController.getAllReservations);

// Get all reservations for a user
router.get('/user/:userId', reservationController.getUserReservations);

// Cancel a reservation
router.post('/:reservationId/cancel', reservationController.cancelReservation);

// Check in to a reservation
router.post('/:reservationId/checkin', reservationController.checkIn);

// Check out from a reservation
router.post('/:reservationId/checkout', reservationController.checkOut);

// Update reservation status (admin)
router.patch('/:reservationId/status', reservationController.updateReservationStatus);

module.exports = router; 