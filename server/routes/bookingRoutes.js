const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.put('/:id/cancel', bookingController.cancelBooking);

router.get('/resident/:resident_id', bookingController.getResidentBookings);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
// 🌟 NEW: Blackout Dates Routes
router.post('/blackouts', bookingController.addBlackoutDate);
router.get('/blackouts', bookingController.getBlackoutDates);
router.delete('/blackouts/:id', bookingController.deleteBlackoutDate);

module.exports = router;