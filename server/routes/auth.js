const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
} = require("../controllers/authController");

// Endpoint đăng ký
router.post("/register", register);

// Endpoint đăng nhập
router.post("/login", login);

// Endpoint xác thực email (token truyền qua query)
router.get("/verify-email", verifyEmail);

module.exports = router;
