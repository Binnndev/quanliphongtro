const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const multer = require("multer");
const path = require("path");
const { getUserRole } = require("../middlewares/authMiddleware");

// Cấu hình Multer để lưu file ảnh upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/rooms/"); // Thư mục tồn tại
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Các endpoint sử dụng roomController duy nhất
router.get("/", roomController.getRooms); // Lấy danh sách room (có lọc)
router.get("/:id", roomController.getRoomById); // Lấy chi tiết 1 room
router.get("/landlord/:landlordId", roomController.getRoomsByLandlord);
router.get("/tenant/:tenantId", roomController.getRoomsByTenant); // Lấy danh sách phòng của một khách thuê

// Các endpoint cho thao tác tạo, cập nhật, xóa (có kiểm tra quyền nếu cần)
router.post(
  "/",
  getUserRole,
  upload.single("image"),
  (req, res, next) => {
    if (req.role !== "Chủ trọ")
      return res.status(403).json({ error: "Không có quyền" });
    next();
  },
  roomController.createRoom
);

router.put(
  "/:id",
  getUserRole,
  upload.single("image"),
  (req, res, next) => {
    if (req.role !== "Chủ trọ")
      return res.status(403).json({ error: "Không có quyền" });
    next();
  },
  roomController.updateRoom
);

router.delete(
  "/:id",
  getUserRole,
  (req, res, next) => {
    if (req.role !== "Chủ trọ")
      return res.status(403).json({ error: "Không có quyền" });
    next();
  },
  roomController.deleteRoom
);

module.exports = router;
