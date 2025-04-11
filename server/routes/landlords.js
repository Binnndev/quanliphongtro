const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController'); // Import your controller
const { route } = require('./auth');

router.get('/:landlordUserId/houses', landlordController.getLandlordHouses); // Get all houses by landlord ID);
router.get('/:landlordUserId/tenants', landlordController.getLandlordTenantsWithAccount); // Get all tenants by landlord ID);

module.exports = router;