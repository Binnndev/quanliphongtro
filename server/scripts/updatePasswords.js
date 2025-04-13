require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../models");

async function updatePasswords() {
  try {
    const accounts = await db.TaiKhoan.findAll();

    for (const acc of accounts) {
      // Kiểm tra xem mật khẩu đã được hash chưa
      // Bcrypt hash thường bắt đầu bằng "$2a$", "$2b$" hoặc "$2y$" và có độ dài khoảng 60 ký tự
      if (
        !acc.MatKhau.startsWith("$2a$") &&
        !acc.MatKhau.startsWith("$2b$") &&
        !acc.MatKhau.startsWith("$2y$")
      ) {
        const plainPassword = acc.MatKhau; // mật khẩu hiện tại đang ở dạng plaintext
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        acc.MatKhau = hashedPassword;
        await acc.save();

        console.log(`Đã hash và cập nhật tài khoản: ${acc.TenDangNhap}`);
      } else {
        console.log(`Tài khoản ${acc.TenDangNhap} đã có mật khẩu hash`);
      }
    }

    console.log("Cập nhật mật khẩu hoàn tất!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi cập nhật mật khẩu:", error);
    process.exit(1);
  }
}

updatePasswords();
