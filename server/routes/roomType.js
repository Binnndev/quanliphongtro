const express = require("express");
const router = express.Router();
const roomTypeController = require("../controllers/roomTypeController");
const { getUserRole } = require("../middlewares/authMiddleware");

router.get("/",
    getUserRole, // This likely sets req.user (including req.user.role)
    (req, res, next) => {
        // **** CHANGE THIS LINE ****
        // Check req.user.role instead of req.role
        console.log('User data from getUserRole:', req.role); // Add this log
        if (req.role !== "Chủ trọ") { // Also check if req.user exists
            return res.status(403).json({ error: "Không có quyền truy cập." }); // More specific error
        }
        // Role is correct, proceed to the controller
        next();
    },
    roomTypeController.getAllRoomTypes); // Lấy danh sách loại phòng

router.post("/",
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ") {
            return res.status(403).json({ error: "Không có quyền truy cập." });
        }
        next();
    },
    roomTypeController.createRoomType); // Tạo loại phòng mới

router.put("/:id",
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ") {
            return res.status(403).json({ error: "Không có quyền truy cập." });
        }
        next();
    },
    roomTypeController.updateRoomType); // Cập nhật loại phòng

router.delete("/:id",
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ") {
            return res.status(403).json({ error: "Không có quyền truy cập." });
        }
        next();
    },
    roomTypeController.deleteRoomType); // Xóa loại phòng

module.exports = router;