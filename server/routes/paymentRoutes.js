const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createInvoice);
router.put('/:id/approve', paymentController.approvePayment);

router.get('/resident/:resident_id', paymentController.getResidentPayments);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

router.put('/:id/upload-slip', paymentController.uploadSlip);

router.put('/:id/approve', paymentController.approvePayment);
router.put('/:id/reject', paymentController.rejectPayment);

router.post('/reminders/overdue', paymentController.sendOverdueReminders);

module.exports = router;