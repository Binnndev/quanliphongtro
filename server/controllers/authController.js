const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";
const JWT_THOI_HAN = process.env.JWT_THOI_HAN || "1h";

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được đăng ký" });
    }
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Tạo token xác minh email bằng crypto
    const emailToken = crypto.randomBytes(20).toString("hex");
    // Tạo tài khoản mới
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role, // 'owner' hoặc 'tenant'
      emailToken,
      emailVerified: false,
    });
    // Cấu hình nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ví dụ: penhouse791@gmail.com
        pass: process.env.EMAIL_PASS, // App password nếu dùng Gmail
      },
    });
    // Link xác minh (sử dụng CLIENT_URL từ .env, ví dụ http://localhost:3000)
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác thực Email - Quản Lý Nhà Trọ",
      text: `Chào ${username},\n\nVui lòng xác thực email của bạn bằng cách truy cập vào link sau:\n${verificationUrl}\n\nTrân trọng,\nQuản Lý Nhà Trọ`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Lỗi gửi email:", err);
        return res.status(500).json({ error: "Gửi email xác thực thất bại" });
      }
      return res.status(201).json({
        message:
          "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      });
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
// xác thực email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token không hợp lệ" });
    const user = await User.findOne({ where: { emailToken: token } });
    if (!user) return res.status(400).json({ error: "Token không hợp lệ" });
    user.emailVerified = true;
    user.emailToken = null;
    await user.save();
    return res
      .status(200)
      .json({ message: "Email đã được xác thực thành công" });
  } catch (error) {
    console.error("Lỗi xác thực email:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// đăng nhập
exports.dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    if (!email || !matKhau) {
      return res.status(400).json({ loi: "Thiếu email hoặc mật khẩu" });
    }
    const nguoiDung = await NguoiDung.findOne({ where: { email } });
    if (!nguoiDung) {
      return res.status(400).json({ loi: "Thông tin đăng nhập không hợp lệ" });
    }
    const hopLe = await bcrypt.compare(matKhau, nguoiDung.matKhau);
    if (!hopLe) {
      return res.status(400).json({ loi: "Thông tin đăng nhập không hợp lệ" });
    }
    const duLieuToken = { id: nguoiDung.id, vaiTro: nguoiDung.vaiTro };
    const token = jwt.sign(duLieuToken, JWT_SECRET, {
      expiresIn: JWT_THOI_HAN,
    });
    return res.status(200).json({ thongBao: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ loi: "Lỗi máy chủ" });
  }
};

// quên mật khẩu
exports.quenMatKhau = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ loi: "Cần cung cấp email" });
    }
    const nguoiDung = await NguoiDung.findOne({ where: { email } });
    if (!nguoiDung) {
      return res
        .status(400)
        .json({ loi: "Không tồn tại người dùng với email này" });
    }
    // Tạo token đặt lại mật khẩu (sử dụng JWT)
    const tokenDatLai = jwt.sign({ id: nguoiDung.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    nguoiDung.tokenDatLaiMatKhau = tokenDatLai;
    nguoiDung.hanTokenDatLai = Date.now() + HAN_TOKEN_DAT_LAI;
    await nguoiDung.save();

    // Cấu hình nodemailer (sử dụng Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const duongDanDatLai = `${req.protocol}://${req.get(
      "host"
    )}/dat-lai-mat-khau?token=${tokenDatLai}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: nguoiDung.email,
      subject: "Đặt lại mật khẩu",
      text:
        "Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu.\n\n" +
        "Vui lòng nhấn vào đường dẫn sau hoặc dán nó vào trình duyệt của bạn để hoàn tất quá trình:\n\n" +
        duongDanDatLai +
        "\n\nNếu không phải bạn yêu cầu, hãy bỏ qua email này.\n",
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Lỗi gửi email:", err);
        return res.status(500).json({ loi: "Gửi email thất bại" });
      } else {
        return res
          .status(200)
          .json({ thongBao: "Email đặt lại mật khẩu đã được gửi" });
      }
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    return res.status(500).json({ loi: "Lỗi máy chủ" });
  }
};

// đặt lại mật khẩu
exports.datLaiMatKhau = async (req, res) => {
  try {
    const { token, matKhauMoi } = req.body;
    if (!token || !matKhauMoi) {
      return res
        .status(400)
        .json({ loi: "Cần cung cấp token và mật khẩu mới" });
    }
    let duLieu;
    try {
      duLieu = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ loi: "Token không hợp lệ hoặc đã hết hạn" });
    }
    const nguoiDung = await NguoiDung.findOne({
      where: {
        id: duLieu.id,
        tokenDatLaiMatKhau: token,
        hanTokenDatLai: { [Op.gt]: Date.now() },
      },
    });
    if (!nguoiDung) {
      return res
        .status(400)
        .json({ loi: "Token không hợp lệ hoặc đã hết hạn" });
    }
    const muoi = await bcrypt.genSalt(10);
    const matKhauMaHoa = await bcrypt.hash(matKhauMoi, muoi);
    nguoiDung.matKhau = matKhauMaHoa;
    nguoiDung.tokenDatLaiMatKhau = null;
    nguoiDung.hanTokenDatLai = null;
    await nguoiDung.save();
    return res
      .status(200)
      .json({ thongBao: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return res.status(500).json({ loi: "Lỗi máy chủ" });
  }
};

//Endpoint đăng nhập (POST /api/auth/login)

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    }
    // So sánh mật khẩu
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    }
    // Kiểm tra nếu email chưa được xác thực
    if (!user.emailVerified) {
      return res.status(403).json({ error: "Email chưa được xác thực" });
    }
    // Tạo JWT chứa thông tin user (id, role)
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_THOI_HAN,
    });
    return res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
