require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Kết nối MySQL với Sequelize
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("quanlyphongtro", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Kết nối cơ sở dữ liệu thành công!"))
  .catch((err) => console.error("Không thể kết nối cơ sở dữ liệu:", err));

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
