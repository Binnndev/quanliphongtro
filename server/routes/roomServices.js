// routes/roomServices.js
const express = require("express");
const router = express.Router();
const { Roomservice, Service } = require("../models");
const { getRoomServices, addRoomService,deleteRoomService } = require("../controllers/roomServiceController");

// GET: Lấy danh sách dịch vụ theo mã phòng
router.get("/room/:roomId", getRoomServices)

router.post("/", addRoomService);
router.delete('/', deleteRoomService);

module.exports = router;
