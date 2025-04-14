// routes/roomServices.js
const express = require("express");
const router = express.Router();
const roomServiceController = require("../controllers/roomServiceController");
const { getUserRole } = require("../middlewares/authMiddleware");

// GET: Lấy danh sách dịch vụ theo mã phòng
router.get("/room/:roomId", roomServiceController.getRoomServices)

// router.post("/add", roomServiceController.addRoomService);
router.post("/upsert", getUserRole,
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
    roomServiceController.upsertRoomServices);
router.delete('/delete/roomId/:roomId/serviceId/:serviceId', roomServiceController.removeServiceFromRoom);

router.post(
    '/add-usage', // Endpoint cho việc cập nhật
    getUserRole,
    (req, res, next) => {
        // **** CHANGE THIS LINE ****
        // Check req.user.role instead of req.role
        console.log('User data from getUserRole:', req.role); // Add this log
        if (req.role !== "Chủ trọ") { // Also check if req.user exists
            return res.status(403).json({ error: "Không có quyền truy cập." }); // More specific error
        }
        // Role is correct, proceed to the controller
        next();
    }, // << Middleware xác thực
    roomServiceController.addServiceUsage // << Controller mới
);

router.post('/add-service',
    getUserRole,
    (req, res, next) => {
        // **** CHANGE THIS LINE ****
        // Check req.user.role instead of req.role
        console.log('User data from getUserRole:', req.role); // Add this log
        if (req.role !== "Chủ trọ") { // Also check if req.user exists
            return res.status(403).json({ error: "Không có quyền truy cập." }); // More specific error
        }
        // Role is correct, proceed to the controller
        next();
    }, // << Middleware xác thực 
    roomServiceController.addRoomServices);

module.exports = router;
