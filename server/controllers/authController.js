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

exports.forgotPassword = async (req, res) => {
  try {
    const { TenDangNhap } = req.body;
    if (!TenDangNhap) {
      return res.status(400).json({ error: "Vui lòng cung cấp tên đăng nhập" });
    }
    const user = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (!user) {
      // Nếu không tìm thấy tài khoản, trả về message an toàn (không tiết lộ thông tin)
      return res
        .status(200)
        .json({ message: "Nếu tài khoản tồn tại, reset token sẽ được tạo" });
    }
    // Tạo reset token (sử dụng crypto)
    const resetToken = crypto.randomBytes(20).toString("hex");
    // Đặt thời gian hết hạn (1 giờ)
    const resetTokenExpiry = Date.now() + 3600000;

    // Lưu token vào DB cho tài khoản
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    return res.status(200).json({
      message: "Reset token đã được tạo",
      resetToken,
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: "Thiếu reset token hoặc mật khẩu mới" });
    }

    // Tìm tài khoản có resetToken phù hợp và chưa hết hạn
    const user = await TaiKhoan.findOne({
      where: {
        resetToken: resetToken,
        resetTokenExpiry: { [require("sequelize").Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Reset token không hợp lệ hoặc đã hết hạn" });
    }

    // Hash mật khẩu mới và cập nhật
    user.MatKhau = await bcrypt.hash(newPassword, 10);
    // Xóa các trường reset token sau khi đặt lại mật khẩu
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Mật khẩu đã được cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
