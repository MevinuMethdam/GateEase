const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.get('/', complaintController.getAllComplaints);
router.post('/', complaintController.createComplaint);
router.get('/resident/:resident_id', complaintController.getResidentComplaints);
router.put('/:id', complaintController.updateComplaintDetails);
router.put('/:id/status', complaintController.updateComplaintStatus);
router.delete('/:id', complaintController.deleteComplaint);

router.post('/:id/updates', complaintController.addComplaintUpdate);
router.get('/:id/updates', complaintController.getComplaintUpdates);
router.put('/:id/feedback', complaintController.submitFeedback);
router.get('/admin/analytics', complaintController.getComplaintAnalytics);

router.get('/maintenance-staff/:staff_name', complaintController.getMaintenanceTasks);
module.exports = router;