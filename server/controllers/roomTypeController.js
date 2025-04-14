// controllers/roomTypeController.js
const { RoomType, Landlord } = require("../models"); // Thêm Landlord vào

exports.getAllRoomTypes = async (req, res) => {
    // Giả sử middleware xác thực đã chạy trước và đặt req.userId (MaTK) và req.role
    const requestingUserId = req.userId; // MaTK của người dùng đang yêu cầu
    const userRole = req.role;

    // Chỉ Chủ trọ mới được lấy danh sách loại phòng của mình
    if (userRole !== 'Chủ trọ') {
        return res.status(403).json({ error: "Không có quyền truy cập chức năng này." });
    }

    if (!requestingUserId) {
         return res.status(401).json({ error: "Thông tin người dùng không hợp lệ hoặc bị thiếu." });
    }

    try {
        // 1. Tìm Landlord dựa trên MaTK (req.userId) để lấy MaChuTro
        const landlord = await Landlord.findOne({
            where: { MaTK: requestingUserId },
            attributes: ['MaChuTro'] // Chỉ lấy MaChuTro cho hiệu quả
        });

        // Nếu không tìm thấy thông tin chủ trọ tương ứng với MaTK
        if (!landlord) {
             console.warn(`Không tìm thấy Landlord với MaTK: ${requestingUserId}`);
             return res.status(404).json({ error: "Không tìm thấy thông tin chủ trọ." });
        }

        const maChuTro = landlord.MaChuTro;

        // 2. Lấy danh sách RoomType dựa trên MaChuTro tìm được
        const roomTypes = await RoomType.findAll({
            where: { MaChuTro: maChuTro } // Lọc theo MaChuTro
        });

        res.status(200).json(roomTypes);

    } catch (error) {
        console.error("Lỗi khi lấy danh sách loại phòng theo chủ trọ:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
};
