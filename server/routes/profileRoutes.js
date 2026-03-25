const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/:id', profileController.getUserProfile);
router.put('/:id', profileController.updateProfile);
router.put('/:id/password', profileController.updatePassword);

// 🌟 NEW: Emergency Contact Update Route එක
router.put('/:id/emergency-contact', profileController.updateEmergencyContact);
module.exports = router;