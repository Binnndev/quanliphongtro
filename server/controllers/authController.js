const { TaiKhoan } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";
const JWT_THOI_HAN = process.env.JWT_THOI_HAN || "1h";

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau, LoaiTaiKhoan } = req.body;
    if (!TenDangNhap || !MatKhau || !LoaiTaiKhoan) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra tài khoản đã tồn tại hay chưa (dựa trên TenDangNhap)
    const existingAccount = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (existingAccount) {
      return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    }

    // Tạo tài khoản mới (hook trong model sẽ tự động mã hóa mật khẩu)
    const newUser = await TaiKhoan.create({
      TenDangNhap,
      MatKhau,
      LoaiTaiKhoan,
      TrangThai: "Kích hoạt",
    });

    return res
      .status(201)
      .json({ message: "Đăng ký thành công", data: newUser });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Xác thực email (chưa triển khai)
exports.verifyEmail = async (req, res) => {
  return res
    .status(501)
    .json({ error: "Chức năng xác thực email chưa được triển khai" });
};

// Đăng nhập tài khoản
exports.login = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau } = req.body;
    if (!TenDangNhap || !MatKhau) {
      return res
        .status(400)
        .json({ error: "Thiếu tên đăng nhập hoặc mật khẩu" });
    }

    const user = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    }

    const isValid = await bcrypt.compare(MatKhau, user.MatKhau);
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    }

    // Tạo token với thuộc tính role (lấy từ LoaiTaiKhoan của TaiKhoan)
    const token = jwt.sign(
      { id: user.MaTK, role: user.LoaiTaiKhoan },
      JWT_SECRET,
      { expiresIn: JWT_THOI_HAN }
    );

    return res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Hàm quên mật khẩu (chưa triển khai)
exports.quenMatKhau = async (req, res) => {
  return res
    .status(501)
    .json({ error: "Chức năng quên mật khẩu chưa được triển khai" });
};

// Hàm đặt lại mật khẩu (chưa triển khai)
exports.datLaiMatKhau = async (req, res) => {
  return res
    .status(501)
    .json({ error: "Chức năng đặt lại mật khẩu chưa được triển khai" });
};
