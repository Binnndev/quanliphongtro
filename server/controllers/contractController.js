const { Contract } = require("../models");

// 🟢 Lấy danh sách hợp đồn
exports.getAllContracts = async (req, res) => {
    try {
        const contracts = await Contract.findAll();
        res.json(contracts);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin hợp đồng theo ID
exports.getContractById = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }
        res.json(contract);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Cập nhật thông tin hợp đồng
exports.updateContract = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }

        await contract.update(req.body);
        res.json({ message: "Cập nhật thành công", contract });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật thông tin hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Thêm hợp đồng mớ
exports.createContract = async (req, res) => {
    try {
        console.log("📌 Dữ liệu nhận được:", req.body);
        const contract = await Contract.create(req.body);
        res.status(201).json({ message: "Thêm hợp đồng thành công", contract });
    } catch (error) {
        console.error("❌ Lỗi khi thêm hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟥 Xoá hợp đồng
exports.deleteContract = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }

        await contract.destroy();
        res.json({ message: "Xoá hợp đồng thành công" });
    } catch (error) {
        console.error("❌ Lỗi khi xoá hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin hợp đồng theo ID khách hàng
exports.getContractByGuestId = async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            where: { MaKH: req.params.id }
        });
        res.json(contracts);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin hợp đồng theo ID phòng
exports.getContractByRoomId = async (req, res) => {
    try {
        const contracts = await Contract.findAll({
            where: { MaPhong: req.params.id }
        });
        res.json(contracts);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// Gia hạn hợp đồng
exports.renewContract = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }

        const newContract = await contract.update({
            NgayKetThuc: req.body.NgayKetThuc
        });
        res.json({ message: "Gia hạn hợp đồng thành công", contract: newContract });
    } catch (error) {
        console.error("❌ Lỗi khi gia hạn hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// Kết thúc hợp đồng
exports.endContract = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }

        const newContract = await contract.update({
            NgayKetThuc: new Date()
        });
        res.json({ message: "Kết thúc hợp đồng thành công", contract: newContract });
    } catch (error) {
        console.error("❌ Lỗi khi kết thúc hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};