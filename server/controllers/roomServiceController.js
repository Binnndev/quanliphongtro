const { RoomService, Service, Room } = require("../models");

exports.getRoomServices = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const services = await Service.findAll({
            include: [
                {
                    model: RoomService,
                    attributes: ["SoLuong"],
                    where: { MaPhong: roomId },
                    required: true, // This ensures that only services associated with the room are returned
                },
            ],
        });
        if (!services || services.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy dịch vụ cho phòng này." });
        }
    
        const formatted = services.map(s => ({
        TenDV: s?.TenDV || '',
        Gia: s?.Gia || 0,
        DonViTinh: s?.DonViTinh || '',
        SoLuong: s.RoomServices?.[0]?.SoLuong || 0
        }));

        // console.log("Services", services)
    
        res.json(formatted);
    } catch (err) {
        console.error("Lỗi lấy dịch vụ phòng:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
}
    
