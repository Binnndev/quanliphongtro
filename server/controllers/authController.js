// authController.js
const { TaiKhoan, Tenant, Landlord, Role } = require("../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");

const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";
const JWT_THOI_HAN = process.env.JWT_THOI_HAN || "1h";

const resetTokens = new Map();

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const {
      TenDangNhap,
      MatKhau,
      confirmPassword,
      LoaiTaiKhoan,
      HoTen,
      CCCD,
      NgaySinh,
      GioiTinh,
      SoDienThoai,
      Email,
      DiaChi,
    } = req.body;

    if (!TenDangNhap || !MatKhau || !confirmPassword || !LoaiTaiKhoan) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    if (TenDangNhap.length < 4 || TenDangNhap.length > 30) {
      return res
        .status(400)
        .json({ error: "Tên đăng nhập phải từ 4-30 ký tự" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(TenDangNhap)) {
      return res
        .status(400)
        .json({ error: "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới" });
    }

    if (MatKhau.length < 6 || MatKhau.length > 50) {
      return res.status(400).json({ error: "Mật khẩu phải từ 6-50 ký tự" });
    }
    if (MatKhau !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });
    }

    const existingAccount = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (existingAccount) {
      return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    }

    const role = await Role.findOne({ where: { TenVaiTro: LoaiTaiKhoan } });
    if (!role) {
      return res
        .status(400)
        .json({ error: `Loại tài khoản '${LoaiTaiKhoan}' không hợp lệ.` });
    }

    const newUser = await TaiKhoan.create({
      TenDangNhap,
      MatKhau,
      MaVaiTro: role.MaVaiTro,
      TrangThai: "Kích hoạt",
    });

    if (LoaiTaiKhoan === "Khách Thuê") {
      if (!HoTen || !CCCD || !NgaySinh || !GioiTinh || !SoDienThoai || !Email) {
        return res.status(400).json({
          error:
            "Khách Thuê cần Họ tên, CCCD, Ngày sinh, Giới tính, SĐT và Email",
        });
      }

      await Tenant.create({
        MaTK: newUser.MaTK,
        HoTen,
        CCCD,
        NgaySinh,
        GioiTinh,
        SoDienThoai,
        Email,
        DiaChi,
        TrangThai: "Đang thuê",
      });
    }

    if (LoaiTaiKhoan === "Chủ Trọ") {
      if (!HoTen || !SoDienThoai || !Email) {
        return res.status(400).json({
          error: "Chủ Trọ cần cung cấp đầy đủ Họ tên, SĐT và Email",
        });
      }

      await Landlord.create({
        MaTK: newUser.MaTK,
        HoTen,
        SoDienThoai,
        Email,
      });
    }

    return res
      .status(201)
      .json({ message: "Đăng ký thành công", data: newUser });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau } = req.body;
    if (!TenDangNhap || !MatKhau) {
      return res
        .status(400)
        .json({ error: "Thiếu tên đăng nhập hoặc mật khẩu" });
    }

    const user = await TaiKhoan.findOne({
      where: { TenDangNhap },
      include: [{ model: Role, attributes: ["TenVaiTro"] }],
    });

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

    if (!user.Role || !user.Role.TenVaiTro) {
      console.error(
        "Lỗi: Không tìm thấy thông tin vai trò hợp lệ cho tài khoản:",
        user.MaTK
      );
      return res
        .status(500)
        .json({ error: "Lỗi cấu hình vai trò người dùng." });
    }

    const jti = uuidv4();
    const token = jwt.sign(
      {
        id: user.MaTK,
        role: user.Role.TenVaiTro,
        jti,
      },
      JWT_SECRET,
      { expiresIn: JWT_THOI_HAN }
    );

    return res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

exports.verifyEmail = async (req, res) => {
  return res
    .status(501)
    .json({ error: "Chức năng xác thực email chưa được triển khai" });
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { TenDangNhap } = req.body;
    if (!TenDangNhap) {
      return res.status(400).json({ error: "Vui lòng cung cấp tên đăng nhập" });
    }
    const user = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (!user) {
      // Trả 200 để bảo mật, không tiết lộ user có tồn tại hay không
      return res
        .status(200)
        .json({ message: "Nếu tài khoản tồn tại, reset token sẽ được tạo" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 giờ

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Thực tế: gửi email có link chứa resetToken
    return res
      .status(200)
      .json({ message: "Reset token đã được tạo", resetToken });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: "Thiếu reset token hoặc mật khẩu mới" });
    }
    const user = await TaiKhoan.findOne({
      where: {
        resetToken,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Reset token không hợp lệ hoặc đã hết hạn" });
    }
    // Hash và lưu mật khẩu mới
    user.MatKhau = await bcrypt.hash(newPassword, 10);
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
