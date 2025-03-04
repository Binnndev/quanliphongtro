const express = require("express");
const { Guest } = require("../models"); // Lấy model từ index.js

const router = express.Router();

// 🟢 Lấy danh sách khách thuê
router.get("/", async (req, res) => {
    try {
        const guests = await Guest.findAll();
        res.json(guests);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách khách:", error);
        res.status(500).json({ message: error.message });
    }
});

// 🟢 Lấy thông tin khách theo ID
router.get("/id/:id", async (req, res) => {
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
});

// 🟢 Lấy thông tin khách theo giới tính
router.get("/gender/:sex", async (req, res) => {
    try {
        const guest = await Guest.findAll({
            where: { GioiTinh: req.params.sex }
        });
        if (!guest) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
        res.json(guest);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
})
module.exports = router;

// Cập nhật thông tin khách
router.patch("/update/:id", async (req, res) => {
    try {
        const guest = await Guest.findByPk(req.params.id);
        if (!guest) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        // Cập nhật chỉ các trường có trong req.body
        await guest.update(req.body);

        res.json({ message: "Cập nhật thành công", guest });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
});

// Thêm khách mới
router.post("/create", async (req, res) => {
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
});

// Xoá khách
router.delete("/delete/:id", async (req, res) => {
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
});