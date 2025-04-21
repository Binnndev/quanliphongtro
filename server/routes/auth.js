const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Endpoint đăng ký
router.post("/register", authController.register);

// Endpoint đăng nhập
router.post("/login", authController.login);

// Endpoint xác thực email (nếu cần)
router.get("/verify-email", authController.verifyEmail);

// Endpoint quên mật khẩu
router.post("/forgot-password", authController.forgotPassword);

// Endpoint đặt lại mật khẩu
router.post("/reset-password", authController.resetPassword);

module.exports = router;
