const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/residents', userController.getAllResidents);
router.post('/residents', userController.addResident);
router.put('/:id', userController.updateResident);    // Edit කරන්න
router.delete('/:id', userController.deleteResident); // Delete කරන්න

module.exports = router;