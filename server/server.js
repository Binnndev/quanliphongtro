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

app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(5000, () => {
  console.log("✅ Server đang chạy tại http://localhost:5000");
});

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "admin",
  password: "quanlynhatro",
  database: "QuanLyNhaTro",
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
