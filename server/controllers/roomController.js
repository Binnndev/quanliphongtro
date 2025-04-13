const { Room, Landlord, RentalHouse } = require("../models");
const { Op } = require("sequelize");

exports.getRooms = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};
    if (status) {
      // Nếu status là "rented" thì room đã được cho thuê, ngược lại chưa cho thuê (rented = false)
      filter.rented = status === "rented" ? true : false;
    }
    if (search) {
      // Dùng đúng tên trường "roomName"
      filter.TenPhong = { [Op.like]: `%${search}%` };
    }
    const rooms = await Room.findAll({ where: filter });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error retrieving rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("Error retrieving room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRoomsByLandlord = async (req, res) => {
  const landlordUserId = req.params.landlordId; // Đây là MaTK của User chủ trọ

  if (!landlordUserId) {
    return res.status(400).send({ message: "Thiếu ID của chủ trọ." });
  }

  try {
    // 1. Tìm MaChuTro dựa vào MaTK (landlordUserId)
    const landlord = await Landlord.findOne({
      where: { MaTK: landlordUserId },
      attributes: ["MaChuTro"], // Chỉ cần lấy MaChuTro
    });

    if (!landlord) {
      // Quan trọng: Trả về mảng rỗng thay vì 404 nếu chủ trọ không tồn tại
      // Vì React component có thể vẫn render bình thường với danh sách rỗng.
      // Nếu muốn báo lỗi rõ ràng thì dùng 404.
      console.log(`Không tìm thấy chủ trọ với MaTK: ${landlordUserId}`);
      return res.status(200).json([]);
      // Hoặc nếu muốn báo lỗi:
      // return res.status(404).send({ message: `Không tìm thấy chủ trọ với ID ${landlordUserId}.` });
    }

      const landlordMaChuTro = landlord.MaChuTro;
      
      const { status, search } = req.query;
    let filter = {};
    if (status) {
      // Nếu status là "rented" thì room đã được cho thuê, ngược lại chưa cho thuê (rented = false)
      filter.rented = status === "rented" ? true : false;
    }
    if (search) {
      // Dùng đúng tên trường "roomName"
      filter.TenPhong = { [Op.like]: `%${search}%` };
    }

    // 2. Tìm tất cả các phòng thuộc các nhà trọ của chủ trọ đó
    const rooms = await Room.findAll({
      include: [
        {
          model: RentalHouse,
          // as: 'House', // Sử dụng alias đã định nghĩa trong Room.associate
          attributes: [], // Không cần lấy thông tin từ House, chỉ dùng để lọc
          required: true, // INNER JOIN - chỉ lấy phòng nào có nhà trọ tồn tại
          where: {
            MaChuTro: landlordMaChuTro, // Lọc theo MaChuTro của chủ trọ
          },
        },
      ],
      // attributes: ['MaPhong', 'TenPhong', 'MaNhaTro', 'TrangThai', 'GhiChu'], // Chọn các trường cần lấy của Room
      order: [
        // Optional: Sắp xếp kết quả, ví dụ theo MaNhaTro rồi đến TenPhong
        [{ model: RentalHouse }, "MaNhaTro", "ASC"],
        ["TenPhong", "ASC"],
        ],
      where: {
        ...filter, // Thêm các điều kiện lọc từ query params
      },
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.error(
      `Error fetching rooms for landlord MaTK ${landlordUserId}:`,
      error
    );
    res.status(500).send({ message: "Lỗi xảy ra khi lấy danh sách phòng." });
  }
};

exports.createRoom = async (req, res) => {
  try {
    // Lấy dữ liệu từ form: roomName, description, price, rented, amenities
    const { roomName, description, price, rented, amenities } = req.body;
    let imageUrl = null;
    // Nếu có file upload (ảnh room)
    if (req.file) {
      imageUrl = req.file.path;
    }
    const newRoom = await Room.create({
      roomName,
      description,
      price,
      rented: rented || false,
      imageUrl,
      amenities,
      MaChuTro: req.userId, // Gán mã chủ trọ từ token, đảm bảo chỉ chủ trọ đăng room của mình
    });
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy dữ liệu từ form: roomName, description, price, rented, amenities
    const { roomName, description, price, rented, amenities } = req.body;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    let imageUrl = room.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }
    await room.update({
      roomName: roomName || room.roomName,
      description: description || room.description,
      price: price || room.price,
      // Nếu trường rented được truyền xuống thì cập nhật, nếu không giữ nguyên
      rented: typeof rented !== "undefined" ? rented : room.rented,
      imageUrl,
      amenities: amenities || room.amenities,
    });
    res.status(200).json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await room.destroy();
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
