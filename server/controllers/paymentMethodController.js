const { PaymentMethod } = require("../models");

// Lấy danh sách phương thức
exports.getAll = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll();
    res.status(200).json(methods);
  } catch (error) {
    console.error("Lỗi lấy danh sách phương thức:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Thêm mới phương thức
exports.create = async (req, res) => {
  try {
    const { TenPTTT, MoTa } = req.body;
    const newMethod = await PaymentMethod.create({ TenPTTT, MoTa });
    res.status(201).json(newMethod);
  } catch (error) {
    console.error("Lỗi tạo phương thức:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Cập nhật phương thức
exports.update = async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ error: "Không tìm thấy phương thức" });

    const { TenPTTT, MoTa } = req.body;
    await method.update({ TenPTTT, MoTa });
    res.status(200).json(method);
  } catch (error) {
    console.error("Lỗi cập nhật phương thức:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Xoá phương thức
exports.delete = async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id);
    if (!method) return res.status(404).json({ error: "Không tìm thấy phương thức" });

    await method.destroy();
    res.status(200).json({ message: "Đã xoá phương thức thành công" });
  } catch (error) {
    console.error("Lỗi xoá phương thức:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
