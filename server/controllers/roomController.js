const { Room, Landlord, RentalHouse, Tenant, RoomType } = require("../models");
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
    const landlordUserId = req.params.landlordId; // This is MaTK

    if (!landlordUserId) {
        return res.status(400).send({ message: "Thiếu ID của chủ trọ (MaTK)." });
    }

    try {
        // 1. Find MaChuTro from MaTK
        const landlord = await Landlord.findOne({
            where: { MaTK: landlordUserId },
            attributes: ["MaChuTro"],
        });

        if (!landlord) {
            console.log(`Không tìm thấy chủ trọ với MaTK: ${landlordUserId}`);
            return res.status(200).json([]); // Return empty array if landlord not found
        }

        const landlordMaChuTro = landlord.MaChuTro;

        // --- Add these logs ---
    console.log("--- Checking Models Before Include ---");
    console.log("Type of RentalHouse:", typeof RentalHouse, "| Name:", RentalHouse ? RentalHouse.name : 'N/A');
    console.log("Type of RoomType:", typeof RoomType, "| Name:", RoomType ? RoomType.name : 'N/A');
    console.log("Type of Tenant:", typeof Tenant, "| Name:", Tenant ? Tenant.name : 'N/A');
    console.log("Type of Room:", typeof Room, "| Name:", Room ? Room.name : 'N/A');
    console.log("-------------------------------------");

        // 2. Find all rooms for this landlord, including RoomType and Tenant
        const rooms = await Room.findAll({
            include: [
                {
                    model: RentalHouse,
                    attributes: [], // Only needed for filtering by landlord
                    required: true, // INNER JOIN to ensure room belongs to a house
                    where: {
                        MaChuTro: landlordMaChuTro, // Filter by the landlord
                    },
                },
                {
                    model: RoomType, // Include RoomType data
                    attributes: ['MaLoaiPhong', 'TenLoai', 'Gia', 'DienTich', 'SoNguoiToiDa'], // Select needed fields
                    required: false, // LEFT JOIN (get room even if RoomType link is broken)
                    // Removed the problematic 'where' clause from here
                },
                {
                    // This assumes a DIRECT Room -> Tenant relationship (e.g., Room.TenantId)
                    // If it's via Contract (Room -> Contract -> Tenant), this needs adjustment
                    model: Tenant, // Include Tenant data
                    attributes: ['HoTen'], // Select tenant's name
                    required: false, // LEFT JOIN (get room even if no tenant linked)
                    // Removed the problematic 'where' clause { LaNguoiDaiDien: true }
                    // TODO: Revisit this include if you need specific tenant based on Contract status
                }
            ],
             // Where clause for the Room itself (applied AFTER filtering by landlord via RentalHouse include)
             where: {
                 // Add any additional filtering for the Room model if needed
                 // e.g., MaNhaTro: someSpecificHouseId (if filtering by house here too)
             },
            order: [
                // Sorting remains the same
                [{ model: RentalHouse }, "MaNhaTro", "ASC"],
                ["TenPhong", "ASC"],
            ],
        });

        // Send the array of rooms (potentially empty)
        res.status(200).json(rooms);

    } catch (error) {
        console.error(
            `Error fetching rooms for landlord MaTK ${landlordUserId}:`,
            error
        );
        // Send generic error message
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
