require("dotenv").config();
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "quanlynhatro",
  database: process.env.DB_NAME || "QuanLyNhaTro",
});

// Phục vụ file tĩnh từ thư mục build của client
app.use(express.static(path.join(__dirname, "../client/build")));

// Đối với mọi route không khớp, trả về file index.html của client
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(5000, () => {
  console.log("✅ Server đang chạy tại http://localhost:5000");
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Kết nối thất bại:", err);
    return;
  }
  console.log("✅ Kết nối thành công đến RDS!");

  connection.query("SHOW TABLES;", (err, results) => {
    if (err) {
      console.error("❌ Truy vấn thất bại:", err);
    } else {
      console.log("📌 Danh sách bảng:", results);
    }
    connection.end();
  });

  connection.query("SELECT * FROM NhaTro;", (err, results) => {
    if (err) {
      console.error("❌ Truy vấn thất bại:", err);
    } else {
      console.log("📌 Danh sách:", results);
    }
    connection.end();
  });
});
