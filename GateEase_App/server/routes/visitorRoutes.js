const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.get('/', visitorController.getAllVisitors);
router.post('/', visitorController.addVisitor);
router.put('/:id/status', visitorController.updateApprovalStatus);

router.get('/resident/:resident_id', visitorController.getResidentVisitors);
router.put('/:id', visitorController.updateVisitor);    // Edit කරන්න
router.delete('/:id', visitorController.deleteVisitor); // Delete කරන්න
module.exports = router;