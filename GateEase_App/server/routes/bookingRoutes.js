const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.put('/:id/cancel', bookingController.cancelBooking);

router.get('/resident/:resident_id', bookingController.getResidentBookings);
router.put('/:id', bookingController.updateBooking);    // Edit කරන්න
router.delete('/:id', bookingController.deleteBooking); // Delete කරන්න
module.exports = router;