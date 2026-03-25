const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/residents', userController.getAllResidents);
router.post('/residents', userController.addResident);
router.put('/:id', userController.updateResident);
router.delete('/:id', userController.deleteResident);
router.put('/:id/deactivate', userController.deactivateUser);

module.exports = router;