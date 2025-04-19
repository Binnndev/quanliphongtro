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
    const {
        TenPhong,
        MaNhaTro,
        MaLoaiPhong,
        TrangThai = 'Còn phòng', // Gán giá trị mặc định nếu frontend không gửi
        GhiChu = null,
        maChuTro// Mô tả có thể là null
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!TenPhong || !MaNhaTro || !MaLoaiPhong) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Tên phòng, Mã nhà trọ và Mã loại phòng.' });
    }

    // (Tùy chọn) Validate thêm nếu cần:
    // - Kiểm tra TrangThai có hợp lệ không ('Còn phòng', 'Hết phòng', 'Đang bảo trì')
    const validTrangThai = ['Còn phòng', 'Hết phòng', 'Đang bảo trì'];
    if (!validTrangThai.includes(TrangThai)) {
        return res.status(400).json({ message: `Trạng thái phòng không hợp lệ. Chỉ chấp nhận: ${validTrangThai.join(', ')}.` });
    }

    try {
        // --- 3. Kiểm tra sự tồn tại và quyền sở hữu ---

        // Kiểm tra xem NhaTro có tồn tại và thuộc sở hữu của chủ trọ đang đăng nhập không
        // Ví dụ sử dụng Sequelize:
        const nhaTro = await RentalHouse.findOne({
            where: {
                MaNhaTro: MaNhaTro,
                MaChuTro: maChuTro // Quan trọng: Đảm bảo nhà trọ này là của chủ trọ hiện tại
            }
        });

        if (!nhaTro) {
            return res.status(404).json({ message: `Nhà trọ với Mã ${MaNhaTro} không tồn tại hoặc bạn không có quyền thêm phòng vào nhà trọ này.` });
        }

        // Kiểm tra xem LoaiPhong có tồn tại không
        // Ví dụ sử dụng Sequelize:
        const loaiPhong = await RoomType.findByPk(MaLoaiPhong);
        if (!loaiPhong) {
            return res.status(400).json({ message: `Loại phòng với Mã ${MaLoaiPhong} không tồn tại.` });
        }

        // --- 4. Tạo bản ghi Phòng mới trong Database ---
        // Ví dụ sử dụng Sequelize:
        const phongMoi = await Room.create({
            TenPhong: TenPhong.trim(), // Trim để loại bỏ khoảng trắng thừa
            MaNhaTro: MaNhaTro,
            MaLoaiPhong: MaLoaiPhong,
            TrangThai: TrangThai,
            GhiChu: GhiChu ? GhiChu.trim() : null,
            // Các trường khác nếu có (ví dụ: ngày tạo,...)
        });

        // --- 5. Chuẩn bị và Gửi Response ---

        // Sau khi tạo thành công, có thể bạn muốn trả về thông tin phòng vừa tạo
        // kèm theo thông tin chi tiết của Loại phòng và Nhà trọ (giống cấu trúc frontend cần)
        // Ví dụ sử dụng Sequelize để lấy lại dữ liệu kèm association:
        const phongMoiChiTiet = await Room.findByPk(phongMoi.MaPhong, {
             include: [
                 {
                     model: RoomType,
                 },
                 {
                     model: RentalHouse // Hoặc tên association khác nếu có
                 }
                 // Thêm các association khác nếu cần
             ]
        });


        // Gửi response thành công (status 201 Created)
        return res.status(201).json(phongMoiChiTiet || phongMoi); // Trả về chi tiết nếu lấy được, nếu không trả về bản ghi cơ bản

    } catch (error) {
        console.error('Lỗi khi thêm phòng trọ:', error);

        // Xử lý lỗi trùng lặp (ví dụ: tên phòng đã tồn tại trong cùng nhà trọ)
        // Cần kiểm tra lỗi cụ thể từ ORM/Database của bạn
        if (error.name === 'SequelizeUniqueConstraintError') { // Ví dụ cho Sequelize
             return res.status(409).json({ message: 'Tên phòng này đã tồn tại trong nhà trọ được chọn.' });
        }

        // Các lỗi khác từ database hoặc logic
        return res.status(500).json({ message: 'Đã xảy ra lỗi phía máy chủ khi thêm phòng.' });
    }
};

exports.updateRoom = async (req, res) => {
    try {
      const { id } = req.params; // Lấy MaPhong từ URL
  
      // *** THAY ĐỔI: Nhận đúng các trường từ frontend ***
      // Lưu ý: Không nhận DienTich, GiaPhong, SoNguoiToiDa trực tiếp từ form
      // vì chúng thuộc về RoomType và chỉ cần MaLoaiPhong để liên kết.
      const {
          TenPhong,
          TrangThai,
          GhiChu,
          MaLoaiPhong, // Nhận MaLoaiPhong
          MaNhaTro // Nhận MaNhaTro (nếu cần cập nhật)
          // Xem xét có cần nhận và xử lý maChuTro từ frontend không? Nếu không thì bỏ qua.
      } = req.body;
  
      const room = await Room.findByPk(id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      // Xử lý file ảnh (nếu có) - giữ nguyên logic này nếu bạn cần upload ảnh khi sửa
      let imageUrl = room.imageUrl; // Giữ ảnh cũ làm mặc định
      // if (req.file) {
      //     // TODO: Xử lý xóa ảnh cũ nếu cần trước khi cập nhật ảnh mới
      //     imageUrl = req.file.path; // Đường dẫn tới ảnh mới
      // }
  
      // *** THAY ĐỔI: Cập nhật đúng các trường trong model ***
      await room.update({
        TenPhong: TenPhong !== undefined ? TenPhong : room.TenPhong, // Cập nhật TenPhong
        TrangThai: TrangThai !== undefined ? TrangThai : room.TrangThai, // Cập nhật TrangThai
        GhiChu: GhiChu !== undefined ? GhiChu : room.GhiChu,       // Cập nhật GhiChu
        MaLoaiPhong: MaLoaiPhong !== undefined ? MaLoaiPhong : room.MaLoaiPhong, // Cập nhật MaLoaiPhong
        MaNhaTro: MaNhaTro !== undefined ? MaNhaTro : room.MaNhaTro, // Cập nhật MaNhaTro (nếu cho phép)
        // imageUrl: imageUrl, // Cập nhật ảnh nếu có thay đổi
        // Không cập nhật DienTich, GiaPhong trực tiếp ở đây vì chúng thuộc về Loại Phòng
      });
  
      // --- GIẢI QUYẾT VẤN ĐỀ 2 ---
      // *** THAY ĐỔI: Tải lại dữ liệu phòng KÈM THEO RoomType (và Tenants nếu cần) trước khi gửi về frontend ***
      const updatedRoomWithDetails = await Room.findByPk(id, {
          include: [
              {
                  model: RoomType, // Include RoomType association
                  attributes: ['Gia', 'TenLoai', 'DienTich', 'SoNguoiToiDa'] // Lấy các trường cần thiết của RoomType
              },
              {
                  model: Tenant, // Include Tenants association (nếu cần hiển thị ở RoomItem)
                  attributes: ['HoTen'], // Lấy các trường cần thiết của Tenant
                  limit: 1 // Có thể giới hạn nếu chỉ cần hiển thị 1 người
              }
              // Thêm các include khác nếu RoomItem cần hiển thị thêm thông tin liên kết
          ]
      });
  
      if (!updatedRoomWithDetails) {
          // Trường hợp hiếm gặp sau khi update thành công
          return res.status(404).json({ error: "Không thể tải lại chi tiết phòng sau khi cập nhật." });
      }
  
      // Trả về dữ liệu phòng đã cập nhật VÀ đầy đủ thông tin liên kết
      res.status(200).json(updatedRoomWithDetails);
  
    } catch (error) {
      console.error("Error updating room:", error);
      // Check for specific Sequelize errors if needed (e.g., validation)
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
