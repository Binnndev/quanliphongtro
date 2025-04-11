const { Service } = require("../models");
const { Op } = require("sequelize");

// Lấy danh sách dịch vụ (có thể lọc theo tên)
exports.getServices = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      filter.TenDV = { [Op.like]: `%${search}%` };
    }

    const services = await Service.findAll({ where: filter });
    res.status(200).json(services);
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Lấy chi tiết 1 dịch vụ
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error("Error retrieving service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Thêm dịch vụ mới
exports.createService = async (req, res) => {
  try {
    const { TenDV, LoaiDichVu, DonViTinh, Gia } = req.body;
    const newService = await Service.create({
      TenDV,
      LoaiDichVu,
      DonViTinh,
      Gia,
    });
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenDV, LoaiDichVu, DonViTinh, Gia } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    await service.update({
      TenDV: TenDV || service.TenDV,
      LoaiDichVu: LoaiDichVu || service.LoaiDichVu,
      DonViTinh: DonViTinh || service.DonViTinh,
      Gia: Gia || service.Gia,
    });

    res.status(200).json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    await service.destroy();
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
