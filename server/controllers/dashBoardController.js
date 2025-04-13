const { Room, RentalHouse, Invoice, Contract, Tenant } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

// 1. Trạng thái phòng (Pie chart)
const getRoomStatus = async (req, res) => {
  try {
    const total = await Room.count();
    const rented = await Room.count({ where: { TrangThai: "Hết phòng" } });
    const available = total - rented;

    res.json({ rented, available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy trạng thái phòng" });
  }
};

// 2. Doanh thu (Bar chart)
const getRevenue = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("NgayLap"), "%m/%Y"), "thang"],
        "MaPhong",
        [fn("SUM", col("TongTien")), "doanhThu"],
      ],
      include: {
        model: Room,
        attributes: ["MaNhaTro"],
        include: {
          model: RentalHouse,
          attributes: ["TenNhaTro"],
        },
      },
      group: ["thang", "Room.MaNhaTro"],
      raw: true,
    });

    // Chuyển thành cấu trúc chart
    const result = {};
    invoices.forEach((item) => {
      const thang = item.thang;
      const nha = item["Room.RentalHouse.TenNhaTro"];
      if (!result[thang]) result[thang] = { thang };
      result[thang][nha] = parseFloat(item.doanhThu);
    });

    res.json(Object.values(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy doanh thu" });
  }
};

// 3. Tổng chi (placeholder)
const getExpense = async (req, res) => {
  // Nếu bạn chưa có bảng chi phí thì mock dữ liệu như dưới
  res.json([
    { thang: "01/2025", "Nha Q7": 2000000 },
    { thang: "02/2025", "Nha Q7": 3500000 },
  ]);
};

// 4. Hợp đồng sắp hết hạn
const getExpiringContracts = async (req, res) => {
  try {
    const today = new Date();
    const next30 = new Date();
    next30.setDate(today.getDate() + 30);

    const contracts = await Contract.findAll({
      where: {
        NgayKetThuc: {
          [Op.between]: [today, next30],
        },
        TrangThai: "Có hiệu lực",
      },
      include: [
        {
          model: Tenant,
          attributes: ["HoTen"],
        },
        {
          model: Room,
          attributes: ["TenPhong"],
          include: {
            model: RentalHouse,
            attributes: ["TenNhaTro"],
          },
        },
      ],
    });

    const result = contracts.map((item) => ({
      hoTen: item.Tenant?.HoTen || "Chưa rõ",
      tenPhong: item.Room?.TenPhong || "Chưa rõ",
      tenNhaTro: item.Room?.RentalHouse?.TenNhaTro || "Chưa rõ",
      ngayKetThuc: item.NgayKetThuc.toLocaleDateString("vi-VN"),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi lấy hợp đồng sắp hết hạn" });
  }
};

module.exports = {
  getRoomStatus,
  getRevenue,
  getExpense,
  getExpiringContracts,
};
