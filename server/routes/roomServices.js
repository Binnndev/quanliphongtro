// routes/roomServices.js
const express = require("express");
const router = express.Router();
const roomServiceController = require("../controllers/roomServiceController");

// GET: Lấy danh sách dịch vụ theo mã phòng
router.get("/room/:roomId", roomServiceController.getRoomServices)

router.post("/add", roomServiceController.addRoomService);
router.delete('/delete/roomId/:roomId/serviceId/:serviceId', roomServiceController.removeServiceFromRoom);

module.exports = router;
