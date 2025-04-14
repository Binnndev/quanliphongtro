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
    // --- FIX: Use roomId to match the route parameter name ---
    const { roomId, maDV } = req.params;

    // Basic validation
    if (!roomId || !maDV) {
        return res.status(400).json({ message: "Thiếu Mã phòng (roomId) hoặc Mã dịch vụ (maDV)." });
    }

    try {
        // Query remains largely the same, but using 'roomId' variable now
        const details = await InvoiceDetail.findAll({
            where: { MaDV: maDV }, // Filter by service ID
            include: [
                {
                    model: Invoice,
                    as: 'Invoice', // Ensure this alias matches your InvoiceDetail model association
                    where: { MaPhong: roomId }, // Filter by room ID via the Invoice
                    attributes: ["MaHoaDon", "NgayLap", "MaPhong"], // Include MaPhong for verification?
                    required: true // Make this an INNER JOIN - only return details linked to an invoice for this room
                },
                {
                    model: Service,
                    as: "Service", // Ensure this alias matches your InvoiceDetail model association
                    attributes: ["TenDV", "Gia", "DonViTinh"], // Maybe include more attributes? Price, Unit?
                    required: false // Change to false (LEFT JOIN) if you want details even if Service record is missing (but check for null below)
                                    // Keep true (INNER JOIN) if details are meaningless without a valid service
                },
            ],
            // Optional: Add ordering if needed, e.g., by date
            // order: [[{ model: Invoice, as: 'Invoice' }, 'NgayLap', 'DESC']]
        });

        // --- DEBUGGING/VALIDATION ---
        console.log(`Found ${details.length} invoice details for roomId: ${roomId}, maDV: ${maDV}`);
        if (details.length > 0) {
             // Log the first result's structure, especially the Service part
             console.log("First detail structure:", JSON.stringify(details[0], null, 2));

             // Explicitly check if Service is missing in any result (if required: true is used, this shouldn't happen often)
             const missingService = details.find(d => !d.Service);
             if (missingService) {
                  console.warn(`WARNING: Found invoice detail(s) but the associated Service (MaDV: ${maDV}) seems missing or failed to join.`);
                  // Decide how to handle: return error, return partial data, etc.
                  // For now, we'll let it pass, but the frontend needs null checks.
             }
        }
        // --------------------------

        // Send the response (might be an empty array if no details found)
        res.json(details);

    } catch (error) {
        console.error(`Lỗi khi lấy chi tiết hóa đơn (Room: ${roomId}, Service: ${maDV}):`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết hóa đơn.", error: error.message });
    }
};
