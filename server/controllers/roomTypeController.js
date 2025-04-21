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

exports.createRoomType = async (req, res) => {
    const { TenLoai, Gia, DienTich, SoNguoiToiDa } = req.body;
    const maChuTro = req.userId; // Lấy MaChuTro từ token hoặc session

    if (!TenLoai || !Gia || !DienTich || !SoNguoiToiDa) {
        return res.status(400).json({ error: "Thiếu thông tin loại phòng" });
    }

    try {
        const newRoomType = await RoomType.create({
            TenLoai,
            Gia,
            DienTich,
            SoNguoiToiDa,
            MaChuTro: maChuTro // Gán MaChuTro vào loại phòng mới
        });

        res.status(201).json(newRoomType);
    } catch (error) {
        console.error("Lỗi khi tạo loại phòng:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
}

exports.updateRoomType = async (req, res) => {
    const { id } = req.params; // Lấy id từ URL
    const { TenLoai, Gia, DienTich, SoNguoiToiDa } = req.body;
    const maChuTro = req.userId; // Lấy MaChuTro từ token hoặc session

    if (!TenLoai || !Gia || !DienTich || !SoNguoiToiDa) {
        return res.status(400).json({ error: "Thiếu thông tin loại phòng" });
    }

    try {
        // Tìm loại phòng theo id và MaChuTro
        const roomType = await RoomType.findOne({
            where: {
                MaLoaiPhong: id,
                MaChuTro: maChuTro // Chỉ cho phép cập nhật loại phòng của chủ trọ này
            }
        });

        if (!roomType) {
            return res.status(404).json({ error: "Không tìm thấy loại phòng" });
        }

        // Cập nhật thông tin loại phòng
        roomType.TenLoai = TenLoai;
        roomType.Gia = Gia;
        roomType.DienTich = DienTich;
        roomType.SoNguoiToiDa = SoNguoiToiDa;

        await roomType.save();

        res.status(200).json(roomType);
    } catch (error) {
        console.error("Lỗi khi cập nhật loại phòng:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
}

exports.deleteRoomType = async (req, res) => {
    const { id } = req.params; // Lấy id từ URL
    const maChuTro = req.userId; // Lấy MaChuTro từ token hoặc session

    try {
        // Tìm loại phòng theo id và MaChuTro
        const roomType = await RoomType.findOne({
            where: {
                MaLoaiPhong: id,
                MaChuTro: maChuTro // Chỉ cho phép xóa loại phòng của chủ trọ này
            }
        });

        if (!roomType) {
            return res.status(404).json({ error: "Không tìm thấy loại phòng" });
        }

        // Xóa loại phòng
        await roomType.destroy();

        res.status(200).json({ message: "Xóa loại phòng thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa loại phòng:", error);
        let statusCode = 500;
        // Ưu tiên lấy message từ lỗi được signal bởi trigger hoặc lỗi ràng buộc
        let message = error.message || "Lỗi server khi xóa loại phòng.";

        if (error.name === 'SequelizeForeignKeyConstraintError' || (error.original && error.original.sqlState === '45000') ) {
             // Lỗi trigger (45000) hoặc lỗi khóa ngoại
             statusCode = 409; // Conflict
             // Nếu là lỗi trigger, error.original.message chứa MESSAGE_TEXT bạn đã set
             message = error.original?.message || `Không thể xóa loại phòng này do có dữ liệu liên quan.`;
        } else if (error.message.includes("Không thể xóa")) {
             // Bắt các message lỗi tùy chỉnh khác nếu cần
             statusCode = 409; // Hoặc 400 Bad Request
        }

        res.status(statusCode).json({ message: message }); // **TRẢ VỀ JSON CÓ MESSAGE**
    }
}