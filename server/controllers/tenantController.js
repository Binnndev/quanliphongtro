const { Tenant, Room, RentalHouse, Landlord, TaiKhoan, sequelize } = require('../models'); // Import đủ models
const fs = require('fs');
const path = require('path'); // Giữ lại path nếu cần dùng ở chỗ khác

// 🟢 Lấy danh sách khách thuê
exports.getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.findAll();
        res.json(tenants);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin khách theo ID
exports.getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }
        res.json(tenant);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin khách theo phòng
exports.getTenantByRoom = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            where: { MaPhong: req.params.roomId }
        });
        res.json(tenants);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
}

// 🟢 Lấy thông tin khách theo giới tính
exports.getTenantByGender = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            where: { GioiTinh: req.params.sex }
        });
        res.json(tenants);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin khách:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin đại diện theo phòng
exports.getRepresentativeByRoom = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({
            where: { MaPhong: req.params.roomId, LaNguoiDaiDien: true, TrangThai: "Đang thuê" }
        });

        if (!tenant) {
            return res.status(404).json({ message: "Không tìm thấy đại diện phòng" });
        }

        res.json(tenant);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin đại diện:", error);
        res.status(500).json({ message: error.message });
    }
};

// Controller: Lấy MaTK chủ trọ cho khách thuê - CÓ DEBUG LOGS
exports.getLandlordAccountForTenant = async (req, res) => {
    const tenantUserId = req.params.tenantUserId; // MaTK của khách thuê

    // Log 1: Bắt đầu xử lý request
    console.log(`[DEBUG] === Bắt đầu getLandlordAccountForTenant cho Khách Thuê MaTK: ${tenantUserId} ===`);

    if (!tenantUserId) {
        // Log 2: Thiếu ID đầu vào
        console.log("[DEBUG] Lỗi: Thiếu tenantUserId trong params.");
        return res.status(400).json({ message: "Thiếu ID khách thuê." });
    }

    try {
        console.log(`[DEBUG] Đang thực hiện Tenant.findOne với MaTK: ${tenantUserId}`);
        const tenant = await Tenant.findOne({
            where: { MaTK: tenantUserId },
            include: [{ // Level 1: Tenant -> Room
                model: Room,
                as: 'Room',
                required: true, // Giữ required: true để dễ debug lỗi thiếu liên kết
                attributes: ['MaPhong', 'MaNhaTro'], // Lấy các khóa cần thiết
                include: [{ // Level 2: Room -> House
                    model: RentalHouse,
                    // as: 'House',
                    required: true,
                    attributes: ['MaNhaTro', 'MaChuTro'], // Lấy các khóa cần thiết
                    include: [{ // Level 3: House -> Landlord
                        model: Landlord,
                        as: 'Landlord',
                        required: true,
                        attributes: ['MaChuTro', 'MaTK', 'HoTen'], // Lấy các khóa cần thiết
                        include: [{ // Level 4: Landlord -> User
                            model: TaiKhoan,
                            as: 'Account',
                            required: true,
                            attributes: ['MaTK', 'TenDangNhap'] // Lấy thông tin User chủ trọ
                        }]
                    }]
                }]
            }],
            attributes: ['MaKhachThue', 'MaTK', 'MaPhong'], // Lấy các trường cần của Tenant để kiểm tra
            // logging: console.log // Bỏ comment dòng này nếu muốn xem câu lệnh SQL được Sequelize tạo ra
        });

        // Log 3: Kết quả trả về từ Sequelize
        // Dùng JSON.stringify để xem cấu trúc rõ ràng, null, 2 để format đẹp
        // Chú ý: Nếu object quá phức tạp hoặc có liên kết vòng, stringify có thể lỗi, khi đó dùng console.log(tenant)
        console.log(`[DEBUG] Kết quả Tenant.findOne:`, JSON.stringify(tenant, null, 2));
        // console.log("[DEBUG] Raw tenant object:", tenant); // Log object gốc nếu stringify lỗi

        // --- Bắt đầu kiểm tra kết quả ---
        if (!tenant) {
            // Log 4a: Không tìm thấy bản ghi Tenant nào với MaTK này
            console.warn(`[DEBUG] *** KHÔNG TÌM THẤY Tenant với MaTK: ${tenantUserId} trong database.`);
            // Trả về 404 nhưng với message rõ hơn cho debug
            return res.status(404).json({ message: `Không tìm thấy khách thuê với MaTK ${tenantUserId}.` });
        }

        // Kiểm tra chuỗi liên kết dữ liệu
        const landlordUser = tenant.Room?.RentalHouse?.Landlord?.Account;

        if (!landlordUser) {
            // Log 4b: Tìm thấy Tenant nhưng chuỗi liên kết bị đứt hoặc dữ liệu lồng nhau bị thiếu
            console.warn(`[DEBUG] *** TÌM THẤY Tenant, nhưng KHÔNG tìm thấy thông tin User chủ trọ lồng nhau.`);
            console.warn(`[DEBUG] Kiểm tra chuỗi dữ liệu trả về:`);
            console.warn(`  - tenant.Room tồn tại: ${!!tenant.Room}`);
            console.warn(`  - tenant.Room?.House tồn tại: ${!!tenant.Room?.House}`);
            console.warn(`  - tenant.Room?.House?.Landlord tồn tại: ${!!tenant.Room?.House?.Landlord}`);
            console.warn(`  - tenant.Room?.House?.Landlord?.User tồn tại: ${!!tenant.Room?.House?.Landlord?.User}`);
            // Thông báo lỗi cho client vẫn giữ nguyên như cũ
            return res.status(404).json({ message: "Không tìm thấy thông tin chủ trọ liên kết đầy đủ." });
        }
        // --- Kết thúc kiểm tra kết quả ---

        // Log 5: Đã trích xuất thành công thông tin User chủ trọ
        console.log(`[DEBUG] Trích xuất thành công thông tin User chủ trọ:`, JSON.stringify(landlordUser, null, 2));
        console.log(`✅ Tìm thấy MaTK chủ trọ (${landlordUser.MaTK}) cho khách thuê ${tenantUserId}`);

        // Trả về kết quả thành công
        res.status(200).json({
            MaTK: landlordUser.MaTK,
            TenDangNhap: landlordUser.TenDangNhap,
            HoTen: tenant.Room.RentalHouse.Landlord.HoTen
        });

    } catch (error) {
        // Log 6: Bắt lỗi trong quá trình thực thi
        console.error(`[DEBUG] ❌ Lỗi nghiêm trọng trong getLandlordAccountForTenant cho khách thuê ${tenantUserId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin chủ trọ." });
    } finally {
         // Log 7: Kết thúc xử lý request
        console.log(`[DEBUG] === Kết thúc getLandlordAccountForTenant cho Khách Thuê MaTK: ${tenantUserId} ===\n`);
    }
};

// 🟢 Lấy danh sách thành viên theo phòng
exports.getMembersByRoom = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            where: { MaPhong: req.params.roomId, LaNguoiDaiDien: false, TrangThai: "Đang thuê" }
        });
        res.json(tenants);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách thành viên:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Cập nhật thông tin khách
exports.updateTenant = async (req, res) => {
    const tenantId = req.params.id;
    try {
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) {
            // Nếu có file mới upload nhưng không tìm thấy khách, xóa file đó đi
            if (req.file) {
                 fs.unlink(req.file.path, (err) => {
                     if (err) console.error("❌ Lỗi khi xóa file upload thừa:", err);
                 });
            }
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        // 1. Lấy dữ liệu từ req.body (đã được multer xử lý)
        //    Lưu ý: tên key trong req.body phải khớp với tên cột trong Model
        const updateData = {
            HoTen: req.body.HoTen,
            CCCD: req.body.CCCD,
            SoDienThoai: req.body.SoDienThoai,
            Email: req.body.Email ? req.body.Email : null, // Nếu có trường này trong body
            NgaySinh: req.body.NgaySinh ? new Date(req.body.NgaySinh) : null, // Chuyển đổi date string
            GioiTinh: req.body.GioiTinh,
            NgayThue: req.body.NgayThue ? new Date(req.body.NgayThue) : null, // Giả sử có cột NgayThue
            GhiChu: req.body.GhiChu,
            TrangThai: req.body.TrangThai,
            LaNguoiDaiDien: req.body.LaNguoiDaiDien === 'true', // Chuyển đổi từ string sang boolean
            AnhGiayTo: req.body.AnhGiayTo // Nếu có trường này trong body
        };

        // 2. Kiểm tra nếu có file ảnh mới được upload
        let oldPhotoPath = tenant.AnhGiayTo ? path.join('uploads', tenant.AnhGiayTo) : null; // Lưu đường dẫn ảnh cũ

        if (req.file) {
            console.log("📁 Có file mới:", req.file.filename);
            updateData.AnhGiayTo = req.file.filename; // Cập nhật tên file ảnh mới vào data
        } else {
             // Nếu không có file mới, giữ nguyên ảnh cũ (không cần làm gì với updateData.AnhGiayTo)
             console.log("🚫 Không có file mới.");
        }

        // Loại bỏ các trường undefined hoặc null khỏi updateData để tránh ghi đè không mong muốn
        Object.keys(updateData).forEach(key => (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]);

        // 3. Thực hiện cập nhật
        await tenant.update(updateData);

        // 4. (Tùy chọn) Xóa ảnh cũ nếu có ảnh mới và ảnh cũ tồn tại
        if (req.file && oldPhotoPath) {
            // Kiểm tra file cũ có tồn tại không trước khi xóa
            fs.access(oldPhotoPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    // File tồn tại, tiến hành xóa
                    fs.unlink(oldPhotoPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("❌ Lỗi khi xóa ảnh cũ:", oldPhotoPath, unlinkErr);
                        } else {
                            console.log("🗑️ Đã xóa ảnh cũ:", oldPhotoPath);
                        }
                    });
                } else {
                    console.log("ℹ️ Không tìm thấy file ảnh cũ để xóa:", oldPhotoPath);
                }
            });
        }

        // Lấy lại thông tin tenant sau khi update để trả về (bao gồm cả tên file ảnh mới nếu có)
        const updatedTenant = await Tenant.findByPk(tenantId);

        res.json({ message: "Cập nhật thành công", tenant: updatedTenant });

    } catch (error) {
        console.error("❌ Lỗi khi cập nhật thông tin khách:", error);
        // Nếu có lỗi trong quá trình xử lý DB mà đã upload file, hãy xóa file đó đi
        if (req.file) {
             fs.unlink(req.file.path, (err) => {
                 if (err) console.error("❌ Lỗi khi xóa file upload do lỗi DB:", err);
             });
        }
        // Nếu lỗi là do validation của Sequelize hoặc multer file filter
        if (error.name === 'SequelizeValidationError' || error.message.includes('Chỉ chấp nhận file ảnh')) {
             res.status(400).json({ message: error.message });
        } else {
             res.status(500).json({ message: "Lỗi máy chủ khi cập nhật thông tin khách." });
        }
    }
};

// 🟢 Thêm khách mới
exports.addTenant = async (req, res) => {
    try {
        // Log cả body và file để debug
        console.log("📌 Dữ liệu body nhận được:", req.body);
        console.log("📁 File nhận được:", req.file); // Kiểm tra xem multer đã xử lý file chưa

        // Lấy các trường text từ req.body
        const { MaPhong, HoTen, MaTK, CCCD, SoDienThoai, Email, NgaySinh, GioiTinh, GhiChu, LaNguoiDaiDien, TrangThai } = req.body;

        // --- Validation được cải thiện ---
        // Kiểm tra các trường text bắt buộc từ body
        // (Bỏ AnhGiayTo ra khỏi check này)
        if (!HoTen || !CCCD || !SoDienThoai || !MaPhong || !NgaySinh || !GioiTinh ) {
            // Thông báo lỗi chính xác hơn cho các trường text
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc: Họ tên, CCCD, Số điện thoại, Mã phòng, Ngày sinh, Giới tính." });
        }

        // Kiểm tra xem file có được upload bởi multer không
        if (!req.file) {
             // Thông báo lỗi cụ thể khi thiếu file
            return res.status(400).json({ message: "Vui lòng tải lên ảnh giấy tờ." });
        }

        // Lấy tên file từ kết quả của multer
        const anhGiayToFilename = req.file.filename;

        // --- Tạo bản ghi Tenant ---
        const tenant = await Tenant.create({
            MaPhong, // Nên đảm bảo MaPhong là kiểu dữ liệu đúng (số?)
            HoTen,
            MaTK: MaTK || null, // Cho phép MaTK là tùy chọn
            CCCD,
            SoDienThoai,
            Email: Email || null, // Cho phép Email là tùy chọn
            NgaySinh, // Đảm bảo định dạng ngày gửi lên tương thích hoặc xử lý ở đây
            GioiTinh,
            GhiChu: GhiChu || null, // Cho phép GhiChu là tùy chọn
            AnhGiayTo: anhGiayToFilename, // *** Dùng tên file từ req.file ***
            // Chuyển đổi giá trị từ FormData (thường là string) nếu cần
            LaNguoiDaiDien: LaNguoiDaiDien === 'true' ? true : false,
            TrangThai: TrangThai || 'Đang thuê' // Dùng trạng thái gửi lên hoặc mặc định
        });

        res.status(201).json(tenant); // Trả về 201 Created và dữ liệu khách mới

    } catch (error) {
        console.error("❌ Lỗi khi tạo khách mới:", error);

        // --- Xử lý dọn dẹp file nếu có lỗi xảy ra sau khi upload ---
        if (req.file) {
            fs.unlink(req.file.path, (err) => { // Xóa file đã upload nếu có lỗi DB
                if (err) console.error("❌ Lỗi khi xóa file upload do lỗi DB:", err);
                else console.log("🗑️ Đã xóa file upload do lỗi DB:", req.file.path);
            });
        }

        // --- Xử lý các loại lỗi cụ thể ---
        // Lỗi validation từ Sequelize (ví dụ: unique constraint)
         if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
             const messages = error.errors.map(e => e.message); // Lấy thông báo lỗi cụ thể
             return res.status(400).json({ message: messages.join(', ') }); // Trả về lỗi 400 với thông báo
         }

        // Các lỗi máy chủ khác
        res.status(500).json({ message: "Lỗi máy chủ khi tạo khách mới." });
    }
};

// 🟢 "Xoá" khách (Thực chất là cập nhật trạng thái thành 'Đã rời đi')
exports.deleteTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: "Không tìm thấy khách hàng" });
        }

        // --- Thay đổi ở đây ---
        // Thay vì tenant.destroy(), cập nhật trạng thái
        const currentDate = new Date(); // Lấy ngày giờ hiện tại
        await tenant.update({
            NgayRoiDi: currentDate,     // Cập nhật ngày rời đi
            TrangThai: 'Đã rời đi'     // Đồng thời cập nhật trạng thái (tùy chọn nhưng nên làm)
        });

        console.log(`✅ Đã cập nhật trạng thái khách ID ${req.params.id} thành 'Đã rời đi'.`);
        // Trả về thông báo thành công (hoặc có thể trả về chính tenant đã cập nhật nếu muốn)
        res.json({ message: "Đã cập nhật trạng thái khách thành 'Đã rời đi' thành công" });
        // --- Kết thúc thay đổi ---

    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái khách hàng:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật trạng thái khách hàng." });
    }
};

// ⭐⭐⭐ HÀM MỚI: Thay đổi người đại diện phòng ⭐⭐⭐
exports.changeRoomRepresentative = async (req, res) => {
    // Lấy roomId và ID người mới từ body như frontend gửi lên
    const { roomId, newRepresentativeId } = req.body; // Đổi tên key cho khớp frontend
    let transaction;

    console.log(`[API Change Rep] Request received: Room ID=${roomId}, New Rep ID=${newRepresentativeId}`);

    try {
        // Validate input
        if (!roomId || !newRepresentativeId) {
            console.log("[API Change Rep] Validation failed: Missing roomId or newRepresentativeId");
            return res.status(400).json({ message: "Thiếu thông tin Phòng hoặc Người đại diện mới." });
        }

        transaction = await sequelize.transaction();
        console.log("[API Change Rep] Transaction started.");

        // 1. Tìm người đại diện mới được chọn (phải đang ở trong phòng và đang thuê)
        console.log(`[API Change Rep] Finding new representative: ID=${newRepresentativeId}, Room=${roomId}`);
        const newRep = await Tenant.findOne({
            where: {
                MaKhachThue: newRepresentativeId,
                MaPhong: roomId,
                NgayRoiDi: null // Phải đang thuê
            },
            transaction
        });

        if (!newRep) {
            console.log("[API Change Rep] New representative not found or already left.");
            await transaction.rollback();
            return res.status(404).json({ message: "Không tìm thấy người thuê được chọn làm đại diện mới trong phòng này hoặc họ đã rời đi." });
        }
        console.log(`[API Change Rep] Found new representative: ${newRep.HoTen}`);

        if (newRep.LaNguoiDaiDien) {
             console.log("[API Change Rep] Selected tenant is already the representative.");
             await transaction.rollback();
             return res.status(400).json({ message: "Người này hiện đã là người đại diện rồi." });
        }


        // 2. Tìm và bỏ trạng thái đại diện của người cũ (nếu có) trong cùng phòng
         console.log(`[API Change Rep] Demoting old representative(s) in Room=${roomId}`);
        const [updateCount] = await Tenant.update(
            { LaNguoiDaiDien: false },
            {
                where: {
                    MaPhong: roomId,
                    LaNguoiDaiDien: true,
                    NgayRoiDi: null // Chỉ tìm người đang thuê
                },
                transaction
            }
        );
        console.log(`[API Change Rep] Demoted ${updateCount} old representative(s).`);


        // 3. Cập nhật người mới thành đại diện
         console.log(`[API Change Rep] Promoting new representative: ID=${newRepresentativeId}`);
        await newRep.update({ LaNguoiDaiDien: true }, { transaction });
        console.log(`[API Change Rep] Successfully promoted ${newRep.HoTen}.`);


        // 4. Commit transaction
        await transaction.commit();
        console.log("[API Change Rep] Transaction committed successfully.");


        // *** Trả về thông tin người đại diện mới để frontend cập nhật state ***
        res.json({
             message: `Đã đổi người đại diện phòng ${roomId} thành công.`,
             newRepresentative: newRep // Gửi kèm dữ liệu người đại diện mới
         });

    } catch (error) {
        console.error(`[API Change Rep] ❌ Error changing representative for room ${roomId}:`, error);
        if (transaction) {
             await transaction.rollback();
             console.log("[API Change Rep] Transaction rolled back due to error.");
        }
        res.status(500).json({ message: error.message || "Lỗi máy chủ khi đổi người đại diện." });
    }
};

// 🟢 Tìm kiếm khách theo tên
exports.searchTenantByName = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            where: {
                TenKH: {
                    [Op.like]: `%${req.query.name}%`
                }
            }
        });
        res.json(tenants);
    } catch (error) {
        console.error("❌ Lỗi khi tìm kiếm khách hàng:", error);
        res.status(500).json({ message: error.message });
    }
}

exports.getMyRoom = async (req, res) => {
    try {
      const maTK = req.user.id; // Lấy từ token sau khi xác thực
  
      const tenant = await Tenant.findOne({
        where: { MaTK: maTK },
        include: [
          {
            model: Room, // Phòng đang thuê
            include: [RoomType, RentalHouse], // Nếu cần
          },
        ],
      });
  
      if (!tenant) return res.status(404).json({ error: "Không tìm thấy thông tin người thuê." });
  
      return res.status(200).json(tenant); // Trả về thông tin phòng
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }
  };

  exports.getMyProfile = async (req, res) => {
    try {
      const maTK = req.user.id;
  
      const tenant = await Tenant.findOne({
        where: { MaTK: maTK },
        include: [
          {
            model: Room,
            include: [RentalHouse]
          },
        ],
      });
  
      if (!tenant) {
        return res.status(404).json({ message: "Không tìm thấy khách thuê." });
      }
  
      res.json(tenant);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin khách thuê:", error);
      res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin cá nhân." });
    }
  };