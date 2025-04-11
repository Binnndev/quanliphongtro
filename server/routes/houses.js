const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController'); // Import your controller


// Define routes
router.get('/', houseController.getAllHouses);
router.get('/:id', houseController.getHouseById);
router.get('/:name', houseController.getHouseByName);
router.post('/', houseController.createHouse);
router.put('/:id', houseController.updateHouse);
router.delete('/:id', houseController.deleteHouse);

module.exports = router;