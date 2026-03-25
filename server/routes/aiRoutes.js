const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST request එකක් ආවම AI එකෙන් analyze කරනවා
router.post('/analyze-complaint', aiController.analyzeComplaint);

module.exports = router;