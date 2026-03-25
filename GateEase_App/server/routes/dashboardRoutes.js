const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboardStats);
// Resident Dashboard Route (අලුතින් එකතු කළ කෑල්ල)
router.get('/resident/:id', dashboardController.getResidentDashboard);

module.exports = router;