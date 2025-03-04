require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
console.log("🔍 Kiểm tra biến môi trường:", process.env.DB_HOST, process.env.DB_PORT);

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log,
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

// Export object chứa Sequelize và kết nối
module.exports = sequelize;
