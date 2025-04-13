// controllers/invoiceDetailController.js
const { InvoiceDetail,Invoice, Service } = require('../models');

exports.getByInvoiceId = async (req, res) => {
  try {
    const invoiceDetails = await InvoiceDetail.findAll({
      where: { MaHoaDon: req.params.invoiceId },  // Tìm theo MaHoaDon (ID)
      include: [
        {
          model: Service,
          as: "Service",
          attributes: ['TenDV', 'Gia'],  // Lấy tên dịch vụ và giá
        },
      ],
    });

    if (!invoiceDetails) {
      return res.status(404).json({ error: 'Không tìm thấy chi tiết hóa đơn' });
    }

    res.status(200).json(invoiceDetails);  // Trả về kết quả chi tiết hóa đơn
  } catch (error) {
    console.error('Lỗi lấy chi tiết hóa đơn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getInvoiceDetail = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Tìm chi tiết hóa đơn
    const invoiceDetails = await InvoiceDetail.findAll({
      where: { MaHoaDon: invoiceId },  // Lấy các chi tiết hóa đơn cho invoiceId
      include: [{
        model: Service,
        attributes: ['TenDV', 'Gia'],  // Lấy tên dịch vụ và giá
      }],
    });

    if (!invoiceDetails) {
      return res.status(404).json({ error: 'Không tìm thấy chi tiết hóa đơn' });
    }

    res.status(200).json(invoiceDetails);
  } catch (error) {
    console.error('Lỗi lấy chi tiết hóa đơn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};
exports.getInvoiceDetailsByRoomAndService = async (req, res) => {
  const { invoiceId,maDV } = req.params;

  try {
    // JOIN ChiTietHoaDon + HoaDon để lọc theo MaPhong
    const details = await InvoiceDetail.findAll({
      where: { MaDV: maDV },
      include: [
        {
          model: Invoice,
          as: "HoaDon",
          where: { MaPhong: invoiceId },
          attributes: ["MaHoaDon", "NgayLap"],
        },
        {
          model: Service,
          as: "Service",
          attributes: ["TenDV"],
        },
      ],
    });

    res.json(details);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết hóa đơn theo phòng và dịch vụ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};
