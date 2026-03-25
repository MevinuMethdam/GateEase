const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/setup', authController.setupAdmin); // Admin ව හදන්න යන පාර

module.exports = router;