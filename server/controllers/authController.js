const { NguoiDung } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";
const JWT_THOI_HAN = process.env.JWT_THOI_HAN || "1h";
const HAN_TOKEN_DAT_LAI = parseInt(process.env.HAN_TOKEN_DAT_LAI) || 3600000;

// đăng ký tài khoản
exports.dangKy = async (req, res) => {
  try {
    const { tenNguoiDung, email, matKhau, vaiTro } = req.body;
    if (!tenNguoiDung || !email || !matKhau || !vaiTro) {
      return res.status(400).json({ loi: "Thiếu thông tin bắt buộc" });
    }
    const nguoiDungTonTai = await NguoiDung.findOne({ where: { email } });
    if (nguoiDungTonTai) {
      return res.status(400).json({ loi: "Email đã tồn tại" });
    }
    const muoi = await bcrypt.genSalt(10);
    c;
    const matKhauMaHoa = await bcrypt.hash(matKhau, muoi);
    const nguoiDungMoi = await NguoiDung.create({
      tenNguoiDung,
      email,
      matKhau: matKhauMaHoa,
      vaiTro, // admin, chuTro, khachThue
    });
    return res
      .status(201)
      .json({ thongBao: "Đăng ký thành công", nguoiDung: nguoiDungMoi });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ loi: "Lỗi máy chủ" });
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
