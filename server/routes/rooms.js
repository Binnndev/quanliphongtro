const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const multer = require("multer");
const path = require("path");

// Cấu hình Multer để lưu ảnh phòng trọ vào thư mục uploads/rooms
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/rooms/"); // Hãy đảm bảo thư mục này tồn tại
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Định nghĩa các endpoint CRUD cho Room
router.get("/", roomController.getRooms); // Lấy danh sách (có lọc trạng thái, tìm kiếm)
router.get("/:id", roomController.getRoomById); // Lấy chi tiết 1 phòng theo ID
router.post("/", upload.single("image"), roomController.createRoom); // Tạo phòng mới
router.put("/:id", upload.single("image"), roomController.updateRoom); // Cập nhật phòng
router.delete("/:id", roomController.deleteRoom); // Xóa phòng

module.exports = router;
