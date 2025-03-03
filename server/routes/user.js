const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { authorize } = require("../middlewares/authMiddleware");

// Route để xem danh sách người dùng (chỉ admin)
router.get("/", authorize("admin"), getAllUsers);

// Route cập nhật thông tin người dùng (admin hoặc chính người đó)
router.put("/:id", authorize(["admin", "owner", "tenant"]), updateUser);

// Route xóa tài khoản (chỉ admin)
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
