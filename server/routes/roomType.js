const express = require("express");
const router = express.Router();
const roomTypeController = require("../controllers/roomTypeController");
const { getUserRole } = require("../middlewares/authMiddleware");

router.get("/",
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ Trọ")
            return res.status(403).json({ error: "Không có quyền" });
        next();
    },
    roomTypeController.getAllRoomTypes); // Lấy danh sách loại phòng

    module.exports = router;