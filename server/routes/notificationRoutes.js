const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/user/:user_id', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;