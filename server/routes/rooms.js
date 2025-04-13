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
router.get("/landlord/:landlordId", roomController.getRoomsByLandlord); // Lấy room theo chủ trọ

// Các endpoint cho thao tác tạo, cập nhật, xóa (có kiểm tra quyền nếu cần)
router.post(
  "/",
  getUserRole,
  upload.single("image"),
  (req, res, next) => {
    if (req.user.role !== "Chủ Trọ")
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
    if (req.user.role !== "Chủ Trọ")
      return res.status(403).json({ error: "Không có quyền" });
    next();
  },
  roomController.updateRoom
);

router.delete(
  "/:id",
  getUserRole,
  (req, res, next) => {
    if (req.user.role !== "Chủ Trọ")
      return res.status(403).json({ error: "Không có quyền" });
    next();
  },
  roomController.deleteRoom
);

module.exports = router;

module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rented: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amenities: {
        type: DataTypes.STRING, // Nếu muốn lưu dữ liệu dạng mảng thì có thể dùng JSON
        allowNull: true,
      },
      MaChuTro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Phong", // Tên bảng trong DB giữ nguyên là "Phong"
      timestamps: false,
    }
  );

  return Room;
};
