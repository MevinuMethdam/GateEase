const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.get('/', complaintController.getAllComplaints);
router.post('/', complaintController.createComplaint);

router.get('/resident/:resident_id', complaintController.getResidentComplaints);
router.put('/:id', complaintController.updateComplaintDetails); // Edit කරන්න
router.put('/:id/status', complaintController.updateComplaintStatus); // Status Update & Notification යවන්න
router.delete('/:id', complaintController.deleteComplaint); // Delete කරන්න

module.exports = router;