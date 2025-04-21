// controllers/contractController.js

const { Contract, Tenant } = require("../models");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const cron = require("node-cron");
const { checkAndExpireContracts } = require("../services/contractService");

// Khởi tạo scheduler chỉ khi không phải môi trường test
if (process.env.NODE_ENV !== "test") {
  console.log("⏰ Contract Expiry Scheduler initialized.");
  cron.schedule(
    "5 0 * * *", // Chạy vào lúc 00:05 hàng ngày
    checkAndExpireContracts,
    { timezone: "Asia/Ho_Chi_Minh" }
  );
}

// 🟢 Lấy danh sách tất cả hợp đồng
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      include: [{ model: Tenant, as: "Tenant" }],
      order: [["NgayLap", "DESC"]],
    });
    return res.status(200).json(contracts);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách hợp đồng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🟢 Lấy chi tiết hợp đồng theo ID
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id, {
      include: [{ model: Tenant, as: "Tenant" }],
    });
    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }
    return res.status(200).json(contract);
  } catch (error) {
    console.error("❌ Lỗi khi lấy hợp đồng theo ID:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🟢 Lấy hợp đồng mới nhất cho phòng
exports.getContractByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const contract = await Contract.findOne({
      where: { MaPhong: roomId },
      include: [{ model: Tenant, as: "Tenant" }],
      order: [["NgayBatDau", "DESC"]],
    });
    if (!contract) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hợp đồng cho phòng này" });
    }
    return res.status(200).json(contract);
  } catch (error) {
    console.error(`❌ Lỗi khi lấy hợp đồng cho phòng ${roomId}:`, error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🟢 Tạo hợp đồng mới
exports.createContract = async (req, res) => {
  const transaction = await Contract.sequelize.transaction();
  try {
    const { MaPhong, NgayBatDau, NgayKetThuc, TienCoc, MaKhachThue } = req.body;
    if (!MaPhong || !NgayBatDau || !NgayKetThuc || !MaKhachThue) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const tenant = await Tenant.findByPk(MaKhachThue);
    if (!tenant) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Khách thuê không tồn tại" });
    }
    const fileName = req.file ? req.file.filename : null;
    const newContract = await Contract.create(
      {
        MaPhong,
        NgayLap: new Date(),
        NgayBatDau: new Date(NgayBatDau),
        NgayKetThuc: new Date(NgayKetThuc),
        TienCoc: TienCoc || 0,
        TrangThai: "Có hiệu lực",
        MaKhachThue,
        FileHopDong: fileName,
      },
      { transaction }
    );
    await transaction.commit();
    return res
      .status(201)
      .json({ message: "Thêm hợp đồng thành công", contract: newContract });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Lỗi khi thêm hợp đồng:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🟢 Cập nhật hợp đồng
exports.updateContract = async (req, res) => {
  const transaction = await Contract.sequelize.transaction();
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);
    if (!contract) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }
    const oldFile = contract.FileHopDong;
    const data = { ...req.body };
    if (req.file) data.FileHopDong = req.file.filename;
    else if (data.deleteFile === "true") data.FileHopDong = null;
    delete data.deleteFile;
    if (data.NgayBatDau) data.NgayBatDau = new Date(data.NgayBatDau);
    if (data.NgayKetThuc) data.NgayKetThuc = new Date(data.NgayKetThuc);
    await contract.update(data, { transaction });
    if (oldFile && req.file) {
      const oldPath = path.join(__dirname, "..", "uploads/contracts", oldFile);
      fs.unlink(oldPath, () => {});
    }
    await transaction.commit();
    return res
      .status(200)
      .json({ message: "Cập nhật hợp đồng thành công", contract });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Lỗi khi cập nhật hợp đồng:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🟢 Hủy hợp đồng
exports.terminateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);
    if (!contract)
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    await contract.update({ TrangThai: "Đã hủy" });
    return res
      .status(200)
      .json({ message: "Hủy hợp đồng thành công", contract });
  } catch (error) {
    console.error("❌ Lỗi khi hủy hợp đồng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// 🟢 Tải file hợp đồng về client
exports.downloadContractFile = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);
    if (!contract || !contract.FileHopDong)
      return res.status(404).json({ message: "Không tìm thấy file hợp đồng" });
    const filePath = path.join(
      __dirname,
      "..",
      "uploads/contracts",
      contract.FileHopDong
    );
    return res.download(filePath, contract.FileHopDong);
  } catch (error) {
    console.error("❌ Lỗi khi tải file hợp đồng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
