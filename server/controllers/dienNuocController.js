const { ElectricWater } = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách chỉ số điện/nước (tùy chọn lọc theo phòng hoặc loại)
exports.getAll = async (req, res) => {
  try {
    const { maPhong, loai } = req.query;
    const where = {};
    if (maPhong) where.MaPhong = maPhong;
    if (loai) where.Loai = loai;

    const records = await ElectricWater.findAll({ where, order: [["NgayGhi", "DESC"]] });
    res.status(200).json(records);
  } catch (error) {
    console.error("Lỗi lấy danh sách điện/nước:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy chi tiết 1 bản ghi điện/nước
exports.getById = async (req, res) => {
  try {
    const record = await ElectricWater.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Không tìm thấy dữ liệu" });
    res.status(200).json(record);
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Tạo mới chỉ số điện/nước
exports.create = async (req, res) => {
  try {
    const { MaPhong, Loai, ChiSoDau, ChiSoCuoi, NgayGhi, TrangThai } = req.body;

    if (parseInt(ChiSoDau) > parseInt(ChiSoCuoi)) {
      return res.status(400).json({ error: "Chỉ số đầu không được lớn hơn chỉ số cuối." });
    }

    const existing = await ElectricWater.findOne({
      where: {
        MaPhong,
        Loai,
        NgayGhi,
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Chỉ số cho phòng này, loại này, ngày này đã tồn tại." });
    }
    // Ngăn chèn trùng tháng
// const exist = await ElectricWater.findOne({
//     where: { MaPhong, Loai, NgayGhi: { [Op.eq]: NgayGhi } },
//   });
//   if (exist) {
//     return res.status(400).json({ error: "Đã có chỉ số cho ngày này." });
//   }
  

    const newRecord = await ElectricWater.create({
      MaPhong,
      Loai,
      ChiSoDau,
      ChiSoCuoi,
      NgayGhi,
      TrangThai: TrangThai || "Chưa tính tiền",
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Lỗi tạo chỉ số:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Cập nhật chỉ số
exports.update = async (req, res) => {
    try {
      const record = await ElectricWater.findByPk(req.params.id);
      if (!record) return res.status(404).json({ error: "Không tìm thấy chỉ số" });
  
      const { ChiSoDau, ChiSoCuoi, NgayGhi, TrangThai } = req.body;
  
      if (parseInt(ChiSoDau) > parseInt(ChiSoCuoi)) {
        return res.status(400).json({ error: "Chỉ số đầu không được lớn hơn chỉ số cuối." });
      }
  
      await record.update({
        ChiSoDau,
        ChiSoCuoi,
        NgayGhi,
        TrangThai: TrangThai || record.TrangThai,
      });
  
      res.status(200).json(record);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  };
  

// Xoá chỉ số
exports.delete = async (req, res) => {
  try {
    const record = await ElectricWater.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Không tìm thấy chỉ số" });

    await record.destroy();
    res.status(200).json({ message: "Đã xoá chỉ số thành công" });
  } catch (error) {
    console.error("Lỗi xoá:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
