const express = require('express');
const router = express.Router();
const rentalHouseManager = require('../controllers/rentalHouseController'); // Import your controller


// Define routes
router.get('/', rentalHouseManager.getAllHouses);
router.get('/:id', rentalHouseManager.getHouseById);
router.get('/:name', rentalHouseManager.getHouseByName);
router.get('/landlord/:landlordId', rentalHouseManager.getHouseByLandlord);
router.post('/', rentalHouseManager.createHouse);
router.put('/:id', rentalHouseManager.updateHouse);
router.delete('/:id', rentalHouseManager.deleteHouse);

module.exports = router;