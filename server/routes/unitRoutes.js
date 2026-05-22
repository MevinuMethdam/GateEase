const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

// http://localhost:5000/api/units
router.get('/', unitController.getAllUnits);
router.post('/', unitController.addUnit);
router.put('/:id', unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;