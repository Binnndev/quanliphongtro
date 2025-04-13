const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashBoardController");

router.get("/room-status", dashboardController.getRoomStatus);
router.get("/revenue", dashboardController.getRevenue);
router.get("/expense", dashboardController.getExpense);
router.get("/expiring-contracts", dashboardController.getExpiringContracts);

module.exports = router;
