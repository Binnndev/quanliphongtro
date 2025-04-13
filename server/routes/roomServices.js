// routes/roomServices.js
const express = require("express");
const router = express.Router();
const { Roomservice, Service } = require("../models");
const { getRoomServices } = require("../controllers/roomServiceController");

// GET: Lấy danh sách dịch vụ theo mã phòng
router.get("/room/:roomId", getRoomServices)

module.exports = router;
