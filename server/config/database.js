require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
console.log("🔍 Kiểm tra biến môi trường:", process.env.DB_HOST, process.env.DB_PORT);
const { Sequelize } = require("sequelize");

// Dùng thông tin từ server.js (host cục bộ 127.0.0.1:3307)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // Sửa từ DB_PASS thành DB_PASSWORD
  {
    host: process.env.DB_HOST, // Đổi thành localhost hoặc 127.0.0.1
    port: process.env.DB_PORT, // Đổi thành 3307 (cùng với server.js)
    dialect: "mysql",
    logging: console.log, // Hiển thị log để debug
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

// Kiểm tra kết nối
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối thành công đến MySQL!");
  } catch (error) {
    console.error("❌ Lỗi kết nối:", error);
  }
}

testConnection();

module.exports = sequelize;
