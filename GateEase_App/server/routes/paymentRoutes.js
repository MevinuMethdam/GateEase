const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createInvoice);
router.put('/:id/approve', paymentController.approvePayment);

// Resident Routes (අලුතින් එකතු කළ කෑල්ල)
router.get('/resident/:resident_id', paymentController.getResidentPayments);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;