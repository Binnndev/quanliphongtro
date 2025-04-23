const { Landlord, RentalHouse, Room, RoomType, Tenant } = require('../models'); // Assuming you have a House model

exports.getAllHouses = async (req, res) => {
  try {
    const houses = await RentalHouse.findAll();
    res.status(200).json(houses);
  } catch (error) {
    console.error("Lỗi lấy danh sách nhà trọ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

exports.getHouseById = async (req, res) => {
  try {
    const house = await RentalHouse.findByPk(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: "Error fetching house", error });
  }
};

exports.getHouseByName = async (req, res) => {
  try {
    const house = await RentalHouse.findOne({
      where: { TenNhaTro: req.params.name },
    });
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: "Error fetching house", error });
  }
};

exports.getRoomsByHouse = async (req, res) => {
    const nhaTroId = req.params.nhaTroId; // Lấy ID nhà trọ từ URL params
    const requestingUserId = req.userId; // Lấy MaTK của người dùng đang request (từ middleware xác thực)

    // --- Kiểm tra đầu vào ---
    if (!nhaTroId || isNaN(parseInt(nhaTroId))) {
        return res.status(400).json({ message: "ID Nhà trọ không hợp lệ." });
    }
    if (!requestingUserId) {
         // Điều này không nên xảy ra nếu có middleware xác thực chạy trước
        return res.status(401).json({ message: "Yêu cầu xác thực không thành công." });
    }
    // -----------------------

    try {
        // --- KIỂM TRA QUYỀN TRUY CẬP ---
        // Lấy thông tin nhà trọ để biết chủ sở hữu
        const house = await RentalHouse.findByPk(nhaTroId, {
             attributes: ['MaChuTro'] // Chỉ cần lấy MaChuTro để kiểm tra quyền
        });

        if (!house) {
            return res.status(404).json({ message: "Nhà trọ không tồn tại." });
        }

        // *** Quan trọng: Logic kiểm tra quyền sở hữu ***
        // Giả định 1: NhaTro.MaChuTro lưu trực tiếp MaTK của TaiKhoan chủ trọ
        // if (house.MaChuTro !== requestingUserId) {
        //     return res.status(403).json({ message: "Bạn không có quyền xem phòng của nhà trọ này." });
        // }

        // Giả định 2: NhaTro.MaChuTro lưu MaChuTro từ bảng Landlord, cần liên kết TaiKhoan -> Landlord
         const landlordProfile = await Landlord.findOne({ where: { MaTK: requestingUserId }, attributes: ['MaChuTro'] });
         if (!landlordProfile || house.MaChuTro !== landlordProfile.MaChuTro) {
              return res.status(403).json({ message: "Bạn không có quyền xem phòng của nhà trọ này." });
         }
         // *** Chọn 1 trong 2 giả định trên hoặc điều chỉnh theo cấu trúc DB của bạn ***
         // --------------------------------

        // --- Lấy danh sách phòng ---
        const rooms = await Room.findAll({
            where: { MaNhaTro: nhaTroId }, // Lọc theo ID nhà trọ
            include: [
                {
                    model: RoomType,
                    // as: 'RoomType', // Thêm alias nếu bạn định nghĩa trong association
                    attributes: ['TenLoai', 'Gia', 'DienTich', 'SoNguoiToiDa'], // Lấy các trường cần thiết của loại phòng
                    required: false // Dùng LEFT JOIN, phòng vẫn hiển thị dù chưa có loại phòng (nên có)
                },
                {
                     model: Tenant,
                     // as: 'Tenants', // Thêm alias nếu bạn định nghĩa
                     attributes: ['MaKhachThue', 'HoTen', 'LaNguoiDaiDien'], // Lấy thông tin cơ bản khách thuê
                     required: false // Dùng LEFT JOIN, phòng vẫn hiển thị dù chưa có khách
                     // Có thể thêm include TaiKhoan của Tenant nếu cần thêm thông tin từ đó
                }
            ],
            order: [
                ['TenPhong', 'ASC'] // Sắp xếp theo tên phòng A-Z (hoặc theo tiêu chí khác)
            ]
        });

        console.log(`✅ API: Fetched ${rooms.length} rooms for house ${nhaTroId}`);
        res.status(200).json(rooms); // Trả về mảng các phòng

    } catch (error) {
        console.error(`❌ API Error: Error fetching rooms for house ${nhaTroId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách phòng." });
    }
};


exports.getHouseByLandlord = async (req, res) => {
    const landlordUserId = req.params.landlordId; // This is the MaTK from the User account

    if (!landlordUserId) {
        // Send 400 Bad Request if the ID is missing from the URL parameter
        return res.status(400).json({ message: "Thiếu ID của chủ trọ (MaTK)." });
    }

    try {
        // 1. Find the Landlord record using MaTK to get MaChuTro
        const landlord = await Landlord.findOne({
            where: { MaTK: landlordUserId },
            attributes: ['MaChuTro'], // Only need the MaChuTro field
        });

        // If no landlord record found for the given MaTK
        if (!landlord) {
            console.log(`Không tìm thấy chủ trọ (Landlord) với MaTK: ${landlordUserId}`);
            // Return 200 OK with an empty array, consistent with previous logic
            return res.status(200).json([]);
        }

        const landlordMaChuTro = landlord.MaChuTro; // Extract the actual landlord ID (MaChuTro)

        // 2. Find all RentalHouses associated with this MaChuTro
        const houses = await RentalHouse.findAll({
            where: {
                MaChuTro: landlordMaChuTro, // Filter by the correct landlord foreign key
            },
             order: [
                // Optional: Add default ordering if desired, e.g., by name or ID
                 ['TenNhaTro', 'ASC']
             ],
             // attributes: ['MaNhaTro', 'TenNhaTro', 'DiaChi'] // Optional: Select only specific fields
        });

        // findAll returns an array ([] if no matches found)
        // Send the array of houses (or empty array) with 200 OK status
        res.status(200).json(houses);

    } catch (error) {
        // Log the detailed error on the server for debugging
        console.error(`Error fetching houses for landlord MaTK ${landlordUserId}:`, error);
        // Send a generic 500 Internal Server Error response to the client
        res.status(500).json({ message: "Lỗi máy chủ xảy ra khi lấy danh sách nhà trọ." });
    }
};

exports.createHouse = async (req, res) => {
    const nhaTroData = req.body;
    const maChuTro = req.body.MaChuTro; // Lấy từ middleware xác thực

    if (!maChuTro) {
         console.error('Authorization Error: Missing MaChuTro in req.user for createHouse.');
         return res.status(403).json({ message: 'Forbidden: Không xác định được chủ trọ.' });
    }

    try {
        // Thêm MaChuTro vào dữ liệu trước khi tạo
        const dataToCreate = { ...nhaTroData, MaChuTro: maChuTro };

        console.log("Attempting to create house with data:", dataToCreate);

        // Validation dữ liệu (nên thêm ở đây hoặc dùng middleware)
        if (!dataToCreate.TenNhaTro || !dataToCreate.DiaChi) {
             return res.status(400).json({ message: 'Tên nhà trọ và Địa chỉ là bắt buộc.' });
        }

        const newHouse = await RentalHouse.create(dataToCreate);
        console.log("House created successfully:", newHouse.MaNhaTro);
        res.status(201).json(newHouse);

    } catch (error) {
        console.error('!!! Error creating house:', error); // Log lỗi chi tiết
         // Xử lý lỗi validation từ Sequelize (ví dụ)
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: "Lỗi máy chủ khi tạo nhà trọ." }); // Thông báo lỗi an toàn
    }
};

exports.updateHouse = async (req, res) => {
    const houseId = req.params.id; // Lấy MaNhaTro từ URL
    const nhaTroData = req.body;
    const maChuTro = req.body.MaChuTro; // Lấy MaChuTro từ user đăng nhập

    console.log(`--- Attempting to update House ID: ${houseId} by Landlord ID: ${maChuTro} ---`);
    console.log("Received update data:", nhaTroData);

    if (!maChuTro) {
        console.error('Authorization Error: Missing MaChuTro in req.user for updateHouse.');
        return res.status(403).json({ message: 'Forbidden: Không xác định được chủ trọ.' });
    }

    try {
        // 1. Tìm nhà trọ VÀ kiểm tra quyền sở hữu
        console.log(`Finding NhaTro with ID: ${houseId} for Landlord: ${maChuTro}`);
        const nhaTro = await RentalHouse.findOne({
            where: {
                MaNhaTro: houseId, // <<< SỬA: Dùng đúng tên khóa chính
                MaChuTro: maChuTro  // <<< THÊM: Kiểm tra quyền sở hữu
            }
        });

        // 2. Xử lý không tìm thấy hoặc không có quyền
        if (!nhaTro) {
             console.log(`Update failed: House with ID ${houseId} not found or not owned by landlord ${maChuTro}.`);
             // Kiểm tra xem nhà có tồn tại nhưng không thuộc quyền không
             const houseExists = await RentalHouse.findByPk(houseId); // <<< SỬA: Dùng đúng tên khóa chính
             if (houseExists) {
                  return res.status(403).json({ message: "Forbidden: Bạn không có quyền sửa nhà trọ này." });
             } else {
                  return res.status(404).json({ message: "Nhà trọ không tồn tại." });
             }
        }

        // 3. Thực hiện cập nhật (nên validate nhaTroData trước)
        console.log(`House ${houseId} found and owned by ${maChuTro}. Proceeding with update...`);
        // Không cập nhật MaChuTro hoặc MaNhaTro trong req.body
        const { MaChuTro, MaNhaTro, ...dataToUpdate } = nhaTroData;

        const [updatedCount] = await RentalHouse.update(dataToUpdate, {
            where: {
                MaNhaTro: houseId // <<< SỬA: Dùng đúng tên khóa chính
            }
        });

        console.log(`Rows affected by update: ${updatedCount}`);

        // 4. Lấy và trả về dữ liệu đã cập nhật
        if (updatedCount > 0) {
            const updatedHouse = await RentalHouse.findByPk(houseId); // <<< SỬA: Dùng đúng tên khóa chính
            console.log(`Successfully updated House ID: ${houseId}`);
            return res.status(200).json(updatedHouse);
        } else {
             console.log(`Update called for House ID: ${houseId}, but no rows were changed (maybe data was the same?).`);
             // Trả về dữ liệu hiện tại vì không có gì thay đổi
             const currentHouse = await RentalHouse.findByPk(houseId); // <<< SỬA: Dùng đúng tên khóa chính
             return res.status(200).json(currentHouse);
        }

    } catch (error) {
        console.error(`!!! Error updating House ID ${houseId}:`, error); // Log lỗi chi tiết
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: error.errors.map(e => e.message) });
       }
        res.status(500).json({ message: "Lỗi máy chủ nội bộ khi cập nhật nhà trọ." }); // Thông báo lỗi an toàn
    }
};

exports.deleteHouse = async (req, res) => {
    const houseId = req.params.id; // Lấy MaNhaTro từ URL
    const maChuTro = await RentalHouse.findOne({
        where: { MaNhaTro: houseId },
        attributes: ['MaChuTro']
    }).then(house => house ? house.MaChuTro : null); // Lấy MaChuTro từ nhà trọ

    console.log(`--- Attempting to delete House ID: ${houseId} by Landlord ID: ${maChuTro} ---`);

     if (!maChuTro) {
        console.error('Authorization Error: Missing MaChuTro in req.user for deleteHouse.');
        return res.status(403).json({ message: 'Forbidden: Không xác định được chủ trọ.' });
    }

    try {
         // 1. Tìm nhà trọ VÀ kiểm tra quyền sở hữu trước khi xóa
        console.log(`Finding NhaTro with ID: ${houseId} for Landlord: ${maChuTro} before delete.`);
        const nhaTro = await RentalHouse.findOne({
            where: {
                MaNhaTro: houseId, // <<< SỬA: Dùng đúng tên khóa chính
                MaChuTro: maChuTro  // <<< THÊM: Kiểm tra quyền sở hữu
            }
        });

        // 2. Xử lý không tìm thấy hoặc không có quyền
        if (!nhaTro) {
             console.log(`Delete failed: House with ID ${houseId} not found or not owned by landlord ${maChuTro}.`);
             const houseExists = await RentalHouse.findByPk(houseId); // <<< SỬA: Dùng đúng tên khóa chính
             if (houseExists) {
                  return res.status(403).json({ message: "Forbidden: Bạn không có quyền xóa nhà trọ này." });
             } else {
                  return res.status(404).json({ message: "Nhà trọ không tồn tại." });
             }
        }

        // 3. Thực hiện xóa (Cẩn thận với ràng buộc khóa ngoại!)
        // Nếu có các bảng khác (Phong, DichVuNhaTro,...) tham chiếu đến MaNhaTro này
        // và không có ON DELETE CASCADE, việc xóa sẽ thất bại với lỗi khóa ngoại.
        // Bạn cần xử lý lỗi đó hoặc xóa các bản ghi phụ thuộc trước.
        console.log(`House ${houseId} found and owned by ${maChuTro}. Proceeding with delete...`);
        const deletedCount = await RentalHouse.destroy({
            where: {
                MaNhaTro: houseId // <<< SỬA: Dùng đúng tên khóa chính
            }
        });

        console.log(`Rows affected by delete: ${deletedCount}`);

        // 4. Trả về kết quả
        if (deletedCount === 0) {
            // Trường hợp này không nên xảy ra nếu findOne ở trên thành công
             console.log(`Delete called for House ID: ${houseId}, but no rows were deleted.`);
             return res.status(404).json({ message: "Không tìm thấy nhà trọ để xóa (có thể đã bị xóa trước đó)." });
        }

        console.log(`Successfully deleted House ID: ${houseId}`);
        res.status(200).json({ message: "Xóa nhà trọ thành công." }); // Hoặc 204 No Content

    } catch (error) {
        console.error(`!!! Error deleting House ID ${houseId}:`, error); // Log lỗi chi tiết
         // Xử lý lỗi khóa ngoại cụ thể
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             console.warn(`Foreign key constraint violation when deleting house ${houseId}. Details:`, error.message);
             return res.status(409).json({ // 409 Conflict
                 message: `Không thể xóa nhà trọ này vì vẫn còn dữ liệu liên quan (ví dụ: phòng, dịch vụ,...). Vui lòng xóa dữ liệu liên quan trước.`
             });
         }
        res.status(500).json({ message: "Lỗi máy chủ nội bộ khi xóa nhà trọ." }); // Thông báo lỗi an toàn
    }
};
