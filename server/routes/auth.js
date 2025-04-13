const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Endpoint đăng ký
router.post("/register", register);

// Endpoint đăng nhập
router.post("/login", login);

// Endpoint xác thực email (nếu cần)
router.get("/verify-email", verifyEmail);

// Endpoint quên mật khẩu
router.post("/forgot-password", forgotPassword);

// Endpoint đặt lại mật khẩu
router.post("/reset-password", resetPassword);

module.exports = router;
