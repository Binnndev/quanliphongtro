const { TaiKhoan } = require("../models");
const bcrypt = require("bcryptjs");

// Tạo mới tài khoản (CREATE)
exports.taoTaiKhoan = async (req, res) => {
  console.log("Dữ liệu nhận từ client:", req.body);
  try {
    const { TenDangNhap, MatKhau, LoaiTaiKhoan } = req.body;
    if (!TenDangNhap || !MatKhau || !LoaiTaiKhoan) {
      return res
        .status(400)
        .json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    // Kiểm tra nếu tài khoản đã tồn tại dựa trên TenDangNhap
    const existingAccount = await TaiKhoan.findOne({ where: { TenDangNhap } });
    if (existingAccount) {
      return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    }

    // Tạo tài khoản mới. (Hook trong model sẽ tự động mã hoá mật khẩu)
    // Ở đây set thêm TrangThai là "Kích hoạt" cho tài khoản mới.
    const newTaiKhoan = await TaiKhoan.create({
      TenDangNhap,
      MatKhau,
      LoaiTaiKhoan,
      TrangThai: "Kích hoạt",
    });

    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      data: newTaiKhoan,
    });
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy danh sách tất cả các tài khoản (READ - list)
exports.layDanhSachTaiKhoan = async (req, res) => {
  try {
    const dsTaiKhoan = await TaiKhoan.findAll();
    return res.status(200).json(dsTaiKhoan);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tài khoản:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy thông tin một tài khoản theo mã (READ - single)
exports.layTaiKhoanTheoMa = async (req, res) => {
  try {
    const { id } = req.params; // id tương ứng với cột MaTK
    const taiKhoan = await TaiKhoan.findOne({ where: { MaTK: id } });
    if (!taiKhoan) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }
    return res.status(200).json(taiKhoan);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Cập nhật thông tin tài khoản (UPDATE)
exports.capNhatTaiKhoan = async (req, res) => {
  try {
    const { id } = req.params;
    const taiKhoan = await TaiKhoan.findOne({ where: { MaTK: id } });
    if (!taiKhoan) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }

    const { TenDangNhap, MatKhau, LoaiTaiKhoan, TrangThai } = req.body;
    if (TenDangNhap) {
      taiKhoan.TenDangNhap = TenDangNhap;
    }
    if (MatKhau) {
      // Nếu cập nhật mật khẩu, cần mã hoá lại
      taiKhoan.MatKhau = await bcrypt.hash(MatKhau, 10);
    }
    if (LoaiTaiKhoan) {
      taiKhoan.LoaiTaiKhoan = LoaiTaiKhoan;
    }
    if (TrangThai) {
      taiKhoan.TrangThai = TrangThai;
    }

    await taiKhoan.save();
    return res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      data: taiKhoan,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tài khoản:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Xóa tài khoản (DELETE)
exports.xoaTaiKhoan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCount = await TaiKhoan.destroy({ where: { MaTK: id } });
    if (deleteCount === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy tài khoản cần xóa" });
    }
    return res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
