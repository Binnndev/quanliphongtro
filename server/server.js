require("dotenv").config();
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const taiKhoanRoutes = require("./routes/taiKhoanRoutes");
const path = require("path");
const db = require("./models");
const { Invoice, InvoiceDetail, PaymentDetail, Service, ElectricWater } = db;

// Khởi tạo Express app ngay từ đầu
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Đăng ký các route API
app.use("/api/auth", authRoutes);
app.use("/api/tai-khoan", taiKhoanRoutes);
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/room-type", require("./routes/roomType"));
app.use("/api/houses", require("./routes/rentalHouses"));
app.use("/api/landlords", require("./routes/landlords"));
app.use("/api/tenants", require("./routes/tenants"));
app.use("/api/contracts", require("./routes/contracts"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/service", require("./routes/service"));
app.use("/api/room-services", require("./routes/roomServices"));
app.use("/api/diennuoc", require("./routes/diennuoc"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/payment-method", require("./routes/paymentMethod"));
app.use("/api/invoice", require("./routes/invoice"));
app.use("/api/invoice-detail", require("./routes/invoiceDetail"));

const dashboardRoutes = require("./routes/dashBoard");
app.use("/api/dashboard", dashboardRoutes);

// Phục vụ file tĩnh từ thư mục build của client
app.use(express.static(path.join(__dirname, "../client/build")));

// Phục vụ file tĩnh từ thư mục uploads (chứa các file ảnh)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Đối với mọi route không khớp, trả về file index.html của client
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Sync các bảng dữ liệu bạn phụ trách trước khi khởi động server
Promise.all([
  Invoice.sync(),
  InvoiceDetail.sync(),
  PaymentDetail.sync(),
  Service.sync(),
  ElectricWater.sync(),
])
  .then(() => {
    console.log("✅ Đã sync các bảng hóa đơn, dịch vụ, thanh toán...");
    app.listen(5000, () => {
      console.log("✅ Server đang chạy tại http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi khi sync bảng:", err);
  });

// Kiểm tra kết nối đến RDS
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "quanlynhatro",
  database: process.env.DB_NAME || "QuanLyNhaTro",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Kết nối thất bại:", err);
    return;
  }
  console.log("✅ Kết nối thành công đến RDS!");

  connection.query("SHOW TABLES;", (err, results) => {
    if (err) {
      console.error("❌ Truy vấn SHOW TABLES thất bại:", err);
    } else {
      console.log("📌 Danh sách bảng:", results);
    }
    // Không gọi connection.end() ở đây để đảm bảo truy vấn sau vẫn có thể chạy
  });

  connection.query("SELECT * FROM NhaTro;", (err, results) => {
    if (err) {
      console.error("❌ Truy vấn SELECT từ NhaTro thất bại:", err);
    } else {
      console.log("📌 Danh sách NhaTro:", results);
    }
    connection.end(); // Kết thúc kết nối sau truy vấn cuối cùng
  });
});
