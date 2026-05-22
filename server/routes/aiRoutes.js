const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze-complaint', aiController.analyzeComplaint);

module.exports = router;