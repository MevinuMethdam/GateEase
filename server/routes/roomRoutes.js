const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/requests', roomController.getPendingRequests);
router.put('/requests/:id/approve', roomController.approveRequest);
router.put('/requests/:id/reject', roomController.rejectRequest);
router.get('/my-requests/:userId', roomController.getMyRequests);
router.post('/request', roomController.requestRoom);
router.get('/approved', roomController.getApprovedBookings);

router.get('/', roomController.getAllRooms);
router.post('/', roomController.addRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;