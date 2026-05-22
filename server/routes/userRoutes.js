const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/residents', userController.getAllResidents);
router.post('/residents', userController.addResident);
router.put('/change-password', verifyToken, userController.changePassword);
router.put('/:id', userController.updateResident);
router.delete('/:id', userController.deleteResident);
router.put('/:id/deactivate', userController.deactivateUser);
router.put('/:id/activate', userController.activateUser);

module.exports = router;