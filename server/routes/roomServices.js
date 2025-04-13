// routes/roomServices.js
const express = require("express");
const router = express.Router();
const { DichVuPhong, DichVu } = require("../models");

// GET: Lấy danh sách dịch vụ theo mã phòng
router.get("/room/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const services = await DichVuPhong.findAll({
      where: { MaPhong: roomId },
      include: [
        {
          model: DichVu,
          as: "Service", // đảm bảo model đã định nghĩa alias này
          attributes: ["MaDV", "TenDV", "DonViTinh", "Gia"],
        },
      ],
    });

    const formatted = services.map((item) => ({
      MaDV: item.MaDV,
      TenDV: item.Service?.TenDV || "Không rõ",
      DonViTinh: item.Service?.DonViTinh || "",
      Gia: item.Service?.Gia || 0,
      SoLuong: item.SoLuong,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("❌ Lỗi khi lấy dịch vụ phòng:", err);
    res.status(500).json({ error: "Lỗi server khi lấy dịch vụ phòng" });
  }
});

module.exports = router;
