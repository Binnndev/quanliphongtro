const express = require("express");
const router = express.Router();
const {
  taoTaiKhoan,
  layDanhSachTaiKhoan,
  xoaTaiKhoan,
} = require("../controllers/TaiKhoanController");

// [POST] Tạo tài khoản
router.post("/tao", taoTaiKhoan);

// [GET] Lấy danh sách tài khoản
router.get("/", layDanhSachTaiKhoan);

// [DELETE] Xóa tài khoản theo id (MaTK)
router.delete("/:id", xoaTaiKhoan);

module.exports = router;
