const Reservation = require('../models/bookingModel');
const Notification = require('../models/notificationModel');
const RoomStatus = require('../models/roomStatusModel');
const db = require('../config/db');

const reservationController = {
    async bookRoom(req, res) {
        try {
            const { NoRoom, Location, Building, Date_in_week, TimeSection, Purpose, NumberOfParticipants, Notes } = req.body;
            const userId = req.user.UserID;

            // Validate required fields
            if (!NoRoom || !Location || !Building || !Date_in_week || !TimeSection || !NumberOfParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin bắt buộc'
                });
            }

            // Validate Date_in_week
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            if (!validDays.includes(Date_in_week.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Ngày trong tuần không hợp lệ'
                });
            }

            // Check if the room exists and has enough capacity
            const [room] = await db.query(
                `SELECT Amount FROM SPACE_ROOM 
                 WHERE NoRoom = ? AND Location = ? AND Building = ?`,
                [NoRoom, Location, Building]
            );

            if (!room[0]) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phòng'
                });
            }

            if (room[0].Amount < NumberOfParticipants) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng người vượt quá sức chứa của phòng'
                });
            }

            // Check for time conflicts
            const hasConflict = await Reservation.checkConflict(NoRoom, Location, Building, Date_in_week, TimeSection);
            if (hasConflict) {
                return res.status(400).json({
                    success: false,
                    message: 'Thời gian đã bị trùng với đơn đặt phòng khác'
                });
            }

            // Create reservation
            const reservation = await Reservation.create(
                userId, 
                NoRoom, 
                Location, 
                Building, 
                Date_in_week, 
                TimeSection, 
                Purpose, 
                NumberOfParticipants, 
                Notes
            );

            // Create notification
            await Notification.create(
                `Đơn đặt phòng: ${NoRoom}`,
                `Đơn đặt phòng đang được xử lý`,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Đặt phòng thành công',
                reservation
            });
        } catch (error) {
            console.error('Error booking room:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi đặt phòng',
                error: error.message
            });
        }
    },

    async getUserBookings(req, res) {
        try {
            const userId = req.user.UserID;
            const bookings = await Reservation.findByUser(userId);
            res.json({
                success: true,
                bookings
            });
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy thông tin phòng',
                error: error.message
            });
        }
    },

    async cancelBooking(req, res) {
        try {
            const { reservationId } = req.params;
            const userId = req.user.UserID;

            const reservation = await Reservation.cancel(reservationId, userId);

            // Create notification for cancellation
            await Notification.create(
                'Hủy đặt phòng',
                `Đơn đặt phòng ${reservation.NoRoom} đã được hủy`,
                userId
            );

            res.json({
                success: true,
                message: 'Hủy đặt phòng thành công',
                reservation
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hủy phòng',
                error: error.message
            });
        }
    },

    async checkIn(req, res) {
        try {
            const { reservationId } = req.params;
            const userId = req.user.UserID;

            const reservation = await Reservation.checkIn(reservationId, userId);

            // Create notification
            await Notification.create(
                'Check-in thành công',
                `Bạn đã check-in thành công vào phòng ${reservation.NoRoom}`,
                userId
            );

            res.json({
                success: true,
                message: 'Check-in thành công',
                reservation
            });
        } catch (error) {
            console.error('Error checking in:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi check-in',
                error: error.message
            });
        }
    },

    async checkOut(req, res) {
        try {
            const { reservationId } = req.params;
            const userId = req.user.UserID;

            const reservation = await Reservation.checkOut(reservationId, userId);

            // Create notification
            await Notification.create(
                'Check-out thành công',
                `Bạn đã check-out thành công từ phòng ${reservation.NoRoom}`,
                userId
            );

            res.json({
                success: true,
                message: 'Check-out thành công',
                reservation
            });
        } catch (error) {
            console.error('Error checking out:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi check-out',
                error: error.message
            });
        }
    }
};

module.exports = reservationController;