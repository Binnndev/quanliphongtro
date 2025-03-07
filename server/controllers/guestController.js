const { Guest } = require("../models");

// 🟢 Lấy danh sách khách thuê
exports.getAllGuests = async (req, res) => {
    try {
        const guests = await Guest.findAll();
        res.json(guests);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin khách theo ID
exports.getGuestById = async (req, res) => {
    try {
        const guest = await Guest.findByPk(req.params.id);
        if (!guest) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
        res.json(guest);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin khách theo giới tính
exports.getGuestByGender = async (req, res) => {
    try {
        const guests = await Guest.findAll({
            where: { GioiTinh: req.params.sex }
        });
        res.json(guests);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Cập nhật thông tin khách
exports.updateGuest = async (req, res) => {
    try {
        const guest = await Guest.findByPk(req.params.id);
        if (!guest) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        await guest.update(req.body);
        res.json({ message: "Cập nhật thành công", guest });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Thêm khách mới
exports.createGuest = async (req, res) => {
    try {
        console.log("📌 Dữ liệu nhận được:", req.body);

        const { TenKH, CMND, SoDienThoai, DiaChi, Email, NgaySinh, GioiTinh, NgayDangKy, TrangThaiTaiKhoan, GhiChu, AnhGiayTo } = req.body;

        if (!TenKH || !CMND || !SoDienThoai) {
            return res.status(400).json({ message: "Tên, CMND và số điện thoại không được để trống" });
        }

        const guest = await Guest.create({
            TenKH,
            CMND,
            SoDienThoai,
            DiaChi,
            Email,
            NgaySinh,
            GioiTinh,
            NgayDangKy,
            TrangThaiTaiKhoan,
            GhiChu,
            AnhGiayTo
        });

        res.status(201).json(guest);
    } catch (error) {
        console.error("❌ Lỗi khi tạo khách mới:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Xoá khách
exports.deleteGuest = async (req, res) => {
    try {
        const guest = await Guest.findByPk(req.params.id);
        if (!guest) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        await guest.destroy();
        res.json({ message: "Xoá khách hàng thành công" });
    } catch (error) {
        console.error("❌ Lỗi khi xoá khách hàng:", error);
        res.status(500).json({ message: error.message });
    }
};
