const express = require("express");
const router = express.Router();

// Đảm bảo chỉ import một lần, không khai báo lại
const { getByInvoiceId } = require("../controllers/invoiceDetailController");

// Route để lấy chi tiết hóa đơn theo ID
router.get("/:invoiceId", getByInvoiceId);

module.exports = router;