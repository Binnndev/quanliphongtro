const { PaymentDetail } = require("../models");

// Lấy danh sách thanh toán theo hóa đơn
exports.getByInvoice = async (req, res) => {
  try {
    const { maHoaDon } = req.params;
    const result = await PaymentDetail.findAll({
      where: { MaHoaDon: maHoaDon },
      order: [["NgayThanhToan", "DESC"]],
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi lấy danh sách thanh toán:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Thêm thanh toán mới
exports.create = async (req, res) => {
  try {
    const { MaHoaDon, SoTien, MaPTTT, MaGiaoDich, GhiChu } = req.body;
    const newPayment = await PaymentDetail.create({
      MaHoaDon,
      SoTien,
      NgayThanhToan: new Date(), // thời gian thực
      MaPTTT,
      MaGiaoDich,
      GhiChu,
    });
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Lỗi thêm thanh toán:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Xoá thanh toán
exports.delete = async (req, res) => {
  try {
    const record = await PaymentDetail.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Không tìm thấy thanh toán" });

    await record.destroy();
    res.status(200).json({ message: "Đã xoá thanh toán thành công" });
  } catch (error) {
    console.error("Lỗi xoá thanh toán:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
