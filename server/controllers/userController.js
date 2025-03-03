const { User } = require("../models");

// Lấy danh sách người dùng (chỉ Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi lấy danh sách người dùng:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Nếu không phải Admin, chỉ được cập nhật chính mình
    if (req.user.role !== "admin" && req.user.id != id) {
      return res
        .status(403)
        .json({
          error: "Bạn không có quyền cập nhật thông tin người dùng khác",
        });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    const { username, email, role } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (req.user.role === "admin" && role) {
      user.role = role;
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "Cập nhật thông tin thành công", user });
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

// Xóa tài khoản (chỉ Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xóa tài khoản người dùng" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    await user.destroy();
    return res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    return res.status(500).json({ error: "Lỗi máy chủ" });
  }
};
