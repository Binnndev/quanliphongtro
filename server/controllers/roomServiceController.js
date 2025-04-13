const { RoomService, Service, Room } = require("../models");

exports.getRoomServices = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const services = await Service.findAll({
            include: [
                {
                    model: RoomService,
                    attributes: ["MaDV", "MaPhong", "NgaySuDung", "SoLuong"],
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
            SoLuong: s.RoomServices?.[0]?.SoLuong || 0,
            MaDV: s.RoomServices?.[0]?.MaDV || '',
            NgaySuDung: s.RoomServices?.[0]?.NgaySuDung || '',
            MaPhong: s.RoomServices?.[0]?.MaPhong || '',

        }));

        // console.log("Services", services)
    
        res.json(formatted);
    } catch (err) {
        console.error("Lỗi lấy dịch vụ phòng:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
}
exports.addRoomService = async (req, res) => {
    // 1. Mong đợi req.body là một MẢNG các đối tượng dịch vụ
    const servicesArray = req.body;

    // 2. Kiểm tra đầu vào cơ bản
    if (!Array.isArray(servicesArray) || servicesArray.length === 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ: Yêu cầu một mảng các dịch vụ." });
    }

    // 3. Validate từng item trong mảng và chuẩn bị dữ liệu cho bulkCreate
    const validServiceData = [];
    const validationErrors = [];
    let hasInvalidMaPhong = false; // Cờ để kiểm tra lỗi MaPhong undefined

    for (let i = 0; i < servicesArray.length; i++) {
        const item = servicesArray[i];
        const { MaPhong, MaDV, SoLuong, NgaySuDung } = item;

        // --- KIỂM TRA QUAN TRỌNG ---
        // Kiểm tra MaPhong không phải là undefined hoặc null
        if (MaPhong === undefined || MaPhong === null) {
            console.error(`Lỗi item ${i}: MaPhong bị thiếu hoặc không hợp lệ.`);
            validationErrors.push(`Mục ${i + 1}: Thiếu Mã phòng (MaPhong).`);
            hasInvalidMaPhong = true; // Đánh dấu có lỗi MaPhong
            continue; // Bỏ qua item này
        }
        // Kiểm tra các trường khác
        if (MaDV === undefined || MaDV === null) {
            validationErrors.push(`Mục ${i + 1}: Thiếu Mã dịch vụ (MaDV).`);
            continue;
        }
        if (SoLuong === undefined || isNaN(Number(SoLuong)) || Number(SoLuong) <= 0) {
             validationErrors.push(`Mục ${i + 1} (MaDV: ${MaDV}): Số lượng (${SoLuong}) không hợp lệ.`);
             continue;
        }
        // Kiểm tra định dạng ngày cơ bản YYYY-MM-DD (có thể cần kiểm tra kỹ hơn)
        if (!NgaySuDung || !/^\d{4}-\d{2}-\d{2}$/.test(NgaySuDung)) {
             validationErrors.push(`Mục ${i + 1} (MaDV: ${MaDV}): Ngày sử dụng (${NgaySuDung}) không hợp lệ.`);
             continue;
        }

        // Nếu item hợp lệ, thêm vào mảng để chuẩn bị tạo hàng loạt
        validServiceData.push({
            MaPhong: MaPhong,       // Đảm bảo MaPhong hợp lệ ở đây
            MaDV: MaDV,
            SoLuong: Number(SoLuong), // Đảm bảo là số
            NgaySuDung: NgaySuDung
        });
    }

    // Nếu có lỗi validation nghiêm trọng (như thiếu MaPhong) hoặc không còn item nào hợp lệ
    if (hasInvalidMaPhong || validServiceData.length === 0) {
         console.error("Dữ liệu đầu vào không hợp lệ:", validationErrors);
         return res.status(400).json({
             message: `Dữ liệu không hợp lệ. ${hasInvalidMaPhong ? 'Mã phòng (MaPhong) bị thiếu trong một số mục.' : 'Không có dịch vụ hợp lệ nào để thêm.'}`,
             errors: validationErrors // Trả về chi tiết lỗi validation
         });
    }

    // Nếu có lỗi validation khác nhưng vẫn còn item hợp lệ, có thể cảnh báo
     if (validationErrors.length > 0) {
         console.warn("Một số dịch vụ không hợp lệ đã bị bỏ qua:", validationErrors);
     }


    try {
        // 4. Sử dụng bulkCreate để thêm nhiều bản ghi vào bảng trung gian
        // Thay 'Phong_DichVu' bằng tên Model đúng của bạn
        const createdServices = await RoomService.bulkCreate(validServiceData, {
            ignoreDuplicates: true // Bỏ qua nếu gặp bản ghi vi phạm UNIQUE constraint
                                   // Yêu cầu có UNIQUE constraint trên (MaPhong, MaDV, NgaySuDung)
            // hoặc dùng updateOnDuplicate nếu muốn cập nhật thay vì bỏ qua:
            // updateOnDuplicate: ['SoLuong'], // Chỉ định cột cần cập nhật nếu trùng
        });

        // 5. Phản hồi thành công
        let successMessage = `Đã thêm thành công ${createdServices.length} dịch vụ vào phòng.`;
        // Thông báo nếu có dịch vụ bị bỏ qua do trùng lặp hoặc validation trước đó
        const skippedCount = validServiceData.length - createdServices.length;
        if (skippedCount > 0) {
            successMessage += ` (${skippedCount} dịch vụ có thể đã tồn tại hoặc không hợp lệ và bị bỏ qua).`;
        }
         if (validationErrors.length > 0) {
              successMessage += ` (${validationErrors.length} mục nhập không hợp lệ ban đầu đã bị loại bỏ).`
         }

        res.status(201).json({
            message: successMessage,
            // data: createdServices // Có thể trả về các bản ghi đã tạo nếu frontend cần
        });

    } catch (error) {
        console.error("Lỗi khi thêm (bulk) dịch vụ phòng:", error);
        // Check for specific Sequelize errors if needed
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ message: "Lỗi: Một hoặc nhiều dịch vụ đã tồn tại cho phòng và ngày được chỉ định (Constraint Violated)." });
        }
         if (error.name === 'SequelizeForeignKeyConstraintError') {
              return res.status(400).json({ message: "Lỗi: Mã phòng hoặc mã dịch vụ không tồn tại." });
         }
        res.status(500).json({ message: "Lỗi máy chủ khi thêm dịch vụ phòng.", error: error.message });
    }
};
  
exports.removeServiceFromRoom = async (req, res) => {
    // Lấy MaPhong và MaDV từ request params hoặc body
    // Cách phổ biến là dùng params: /api/rooms/:roomId/services/:serviceId
    const { roomId, serviceId } = req.params;

    // Kiểm tra đầu vào cơ bản
    if (!roomId || !serviceId) {
        return res.status(400).json({ message: "Thiếu Mã phòng hoặc Mã dịch vụ." });
    }

    try {
        // Tìm và xóa bản ghi trong bảng trung gian
        const deletedRowCount = await RoomService.destroy({ // <<== Sử dụng model bảng trung gian
            where: {
                MaPhong: roomId,  // Tên cột MaPhong trong bảng Phong_DichVu
                MaDV: serviceId     // Tên cột MaDV trong bảng Phong_DichVu
            }
        });

        // Kiểm tra xem có bản ghi nào được xóa không
        if (deletedRowCount > 0) {
            // Xóa thành công
            // Có thể trả về 204 No Content nếu không cần message body
            res.status(200).json({ message: "Đã xóa dịch vụ khỏi phòng thành công." });
        } else {
            // Không tìm thấy liên kết này để xóa
            return res.status(404).json({ message: "Không tìm thấy dịch vụ này được áp dụng cho phòng này." });
        }

    } catch (error) {
        console.error("Lỗi khi xóa dịch vụ khỏi phòng:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ." });
    }
};
    

