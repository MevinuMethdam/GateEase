const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// POST request එකක් ආවම chatbotController එකේ handleChat ෆන්ක්ෂන් එක රන් වෙනවා
router.post('/', chatbotController.handleChat);

module.exports = router;