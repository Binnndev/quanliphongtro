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
exports.addRoomService = async (req, res) => {
    try {
      const { MaPhong, MaDV, SoLuong, NgaySuDung } = req.body;
  
      // Check if service already exists for this room + date
      const existing = await RoomService.findOne({ where: { MaPhong, MaDV, NgaySuDung } });
      if (existing) {
        return res.status(400).json({ message: "Dịch vụ này đã tồn tại cho ngày đó." });
      }
  
      const newService = await RoomService.create({
        MaPhong,
        MaDV,
        SoLuong,
        NgaySuDung,
      });
  
      res.status(201).json(newService);
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      res.status(500).json({ message: "Lỗi server khi thêm dịch vụ." });
    }
  };
  
