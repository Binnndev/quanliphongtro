const express = require("express");
const { Guest } = require("../models"); // Lấy model từ index.js

const router = express.Router();

// 🟢 Lấy danh sách khách thuê
router.get("/", async (req, res) => {
  try {
    const guests = await Guest.findAll();
    res.json(guests);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách khách:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
