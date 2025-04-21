require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const taiKhoanRoutes = require("./routes/taiKhoanRoutes");
const roomRoutes = require("./routes/rooms");
const roomTypeRoutes = require("./routes/roomType");
const rentalHousesRoutes = require("./routes/rentalHouses");
const landlordsRoutes = require("./routes/landlords");
const tenantsRoutes = require("./routes/tenants");
const contractsRoutes = require("./routes/contracts");
const notificationsRoutes = require("./routes/notifications");
const serviceRoutes = require("./routes/service");
const roomServicesRoutes = require("./routes/roomServices");
const dienNuocRoutes = require("./routes/diennuoc");
const paymentRoutes = require("./routes/payment");
const paymentMethodRoutes = require("./routes/paymentMethod");
const invoiceRoutes = require("./routes/invoice");
const invoiceDetailRoutes = require("./routes/invoiceDetail");
const dashboardRoutes = require("./routes/dashBoard");

const db = require("./models");
const { Invoice, InvoiceDetail, PaymentDetail, Service, ElectricWater } = db;

const app = express();
const isTest = process.env.NODE_ENV === "test";

// Middleware chung
app.use(cors());
app.use(bodyParser.json());

// Đăng ký các route
app.use("/api/auth", authRoutes);
app.use("/api/tai-khoan", taiKhoanRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-type", roomTypeRoutes);
app.use("/api/houses", rentalHousesRoutes);
app.use("/api/landlords", landlordsRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/room-services", roomServicesRoutes);
app.use("/api/diennuoc", dienNuocRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payment-method", paymentMethodRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/invoice-detail", invoiceDetailRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Phục vụ static files cho client và uploads
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Chỉ chạy scheduler, sync DB và start server khi không phải test
if (!isTest) {
  // Scheduler hóa đơn
  require("./schedulers/invoiceScheduler");

  // Chỉ sync các bảng bạn phụ trách trước khi listen
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

  // Kiểm tra kết nối đến RDS (MySQL)
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "quanlynhatro",
    database: process.env.DB_NAME || "QuanLyNhaTro",
  });

  connection.connect((err) => {
    if (err) {
      console.error("❌ Kết nối RDS thất bại:", err);
      return;
    }
    console.log("✅ Kết nối thành công đến RDS!");
    connection.end();
  });
}

// Xuất app để test (nếu cần)
module.exports = app;
