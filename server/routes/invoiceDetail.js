const express = require("express");
const router = express.Router();

// Đảm bảo chỉ import một lần, không khai báo lại
const { getByInvoiceId,getInvoiceDetailsByRoomAndService } = require("../controllers/invoiceDetailController");

// Route để lấy chi tiết hóa đơn theo ID
router.get("/room/:roomId/service/:maDV", getInvoiceDetailsByRoomAndService);
router.get("/:id", getByInvoiceId);

module.exports = router;