const { TaiKhoan, Landlord, Tenant, Role } = require("../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid'); // Nhập uuid
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";
const JWT_THOI_HAN = process.env.JWT_THOI_HAN || "1h";

exports.register = async (req, res) => {
  try {
    const {
      TenDangNhap,
      MatKhau,
          LoaiTaiKhoan,
    //   MaVaiTro,
      // Thông tin bổ sung
      HoTen,
      SoDienThoai,
      Email,
      DiaChi,
      CCCD,
      NgaySinh,
      GioiTinh,
    } = req.body;
    if (!TenDangNhap || !MatKhau || !LoaiTaiKhoan) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Kiểm tra tài khoản đã tồn tại hay chưa (dựa trên TenDangNhap)
    const existingAccount = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (existingAccount) {
      return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    }
      
      // *** THAY ĐỔI: Tìm MaVaiTro dựa vào TenVaiTro (LoaiTaiKhoan từ input) ***
    const role = await Role.findOne({ where: { TenVaiTro: LoaiTaiKhoan } });
    if (!role) {
      // Nếu không tìm thấy vai trò tương ứng trong bảng Role
      return res.status(400).json({ error: `Loại tài khoản '${LoaiTaiKhoan}' không hợp lệ.` });
    }
    const maVaiTro = role.MaVaiTro; // Lấy ID của vai trò tìm được

    // *** THAY ĐỔI: Sử dụng maVaiTro thay vì LoaiTaiKhoan khi tạo TaiKhoan ***
    const newUser = await TaiKhoan.create({
        TenDangNhap,
        MatKhau, // Hook trong model sẽ hash mật khẩu này
        MaVaiTro: maVaiTro, // Lưu ID vai trò vào cột MaVaiTro
        TrangThai: "Kích hoạt", // Hoặc 'Chờ xác thực' tùy logic của bạn
      });

    if (LoaiTaiKhoan === "Chủ Trọ") {
      await Landlord.create({
        HoTen,
        SoDienThoai,
        Email,
        MaTK: newUser.MaTK,
      });
    } else if (LoaiTaiKhoan === "Khách Thuê") {
      await Tenant.create({
        HoTen,
        SoDienThoai,
        Email,
        CCCD,
        NgaySinh,
        GioiTinh,
        DiaChi,
        MaTK: newUser.MaTK,
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

    const user = await TaiKhoan.findOne({
        where: { TenDangNhap },
        include: [{
          model: Role,
          attributes: ['TenVaiTro']
        }]
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
        console.error("Lỗi: Không tìm thấy thông tin vai trò hợp lệ cho tài khoản:", user.MaTK);
        return res.status(500).json({ error: "Lỗi cấu hình vai trò người dùng." });
    }

    console.log("Đăng nhập lúc:", Date.now());
      
    const loginTime = Date.now();
    const jti = uuidv4(); // Tạo một ID duy nhất cho token này (JWT ID)

    const token = jwt.sign(
      {
        id: user.MaTK,
        role: user.Role.TenVaiTro, // Chủ trọ | Khách thuê
        // loginAt: loginTime, // Vẫn giữ nếu bạn cần thông tin này
        jti: jti,          // Thêm JWT ID duy nhất
      },
      JWT_SECRET,
      { expiresIn: JWT_THOI_HAN }
    );
      
      
    //   474c9484-d15d-453e-ba7b-8128323a88ac
    console.log("Generated JTI:", jti);
      console.log("Token:", token);

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
