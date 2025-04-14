const { RoomService, Service, Room, ElectricWater, sequelize } = require("../models");
const { Op } = require("sequelize");
const { startOfMonth, endOfMonth, format } = require('date-fns');

exports.getRoomServices = async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId, 10);
        if (isNaN(roomId)) {
            return res.status(400).json({ message: "roomId không hợp lệ." });
        }

        const today = new Date();
        const currentMonthStart = startOfMonth(today);
        const currentMonthEnd = endOfMonth(today);
        const formattedStartDate = format(currentMonthStart, 'yyyy-MM-dd');
        const formattedEndDate = format(currentMonthEnd, 'yyyy-MM-dd');

        // --- 1. Lấy thông tin cơ bản của các dịch vụ ĐÃ ĐƯỢC SỬ DỤNG hoặc ĐĂNG KÝ cho phòng ---
        // Cách 1: Lấy các dịch vụ có liên kết trong RoomService (DichVuPhong), kể cả tháng khác
        //          Rồi sau đó mới tính tổng cho tháng hiện tại.
         const registeredServicesInfo = await RoomService.findAll({
            where: { MaPhong: roomId, MaDV: { [Op.notIn]: [1, 2] } }, // Chỉ lấy dịch vụ thường, có trong DichVuPhong
            include: [{
                model: Service,
                attributes: ['TenDV', 'LoaiDichVu', 'Gia', 'DonViTinh'], // Lấy thông tin từ bảng Service
                required: true // Đảm bảo dịch vụ tồn tại trong bảng Service
            }],
            attributes: [
                // Lấy MaDV duy nhất cho mỗi dịch vụ đã đăng ký/sử dụng
                [sequelize.fn('DISTINCT', sequelize.col('RoomService.MaDV')), 'MaDV']
            ],
            group: ['RoomService.MaDV', 'Service.MaDV', 'Service.TenDV', 'Service.LoaiDichVu', 'Service.Gia', 'Service.DonViTinh'], // Group để lấy DISTINCT và thông tin Service
            raw: true, // Lấy kết quả dạng object thuần
            nest: true // Giúp truy cập Service dễ hơn: result.Service.TenDV
         }).then(results => results.map(r => ({ // Map lại cấu trúc cho nhất quán
            MaDV: r.MaDV,
            TenDV: r.Service?.TenDV,
            LoaiDichVu: r.Service?.LoaiDichVu,
            Gia: r.Service?.Gia,
            DonViTinh: r.Service?.DonViTinh
         })));


        // --- 2. Tính tổng số lượng sử dụng TRONG THÁNG HIỆN TẠI từ bảng DichVuPhong ---
        const serviceQuantities = await RoomService.findAll({
            attributes: [
                'MaDV',
                [sequelize.fn('SUM', sequelize.col('SoLuong')), 'totalSoLuong']
            ],
            where: {
                MaPhong: roomId,
                NgaySuDung: { // Chỉ lấy các bản ghi trong tháng hiện tại
                    [Op.between]: [formattedStartDate, formattedEndDate]
                },
                 // Chỉ tính tổng cho các dịch vụ đã đăng ký/sử dụng ở bước 1
                 MaDV: { [Op.in]: registeredServicesInfo.map(s => s.MaDV) }
            },
            group: ['MaDV'],
            raw: true
        });

        // Tạo map để tra cứu tổng số lượng
        const quantityMap = serviceQuantities.reduce((map, item) => {
            map[item.MaDV] = parseInt(item.totalSoLuong, 10) || 0;
            return map;
        }, {});

        // --- 3. Format dịch vụ thông thường với tổng số lượng trong tháng ---
        const formattedRegularServices = registeredServicesInfo.map(svc => {
            let monthlyQuantity = 0;
            // Chỉ tính tổng cho loại 'Theo số lượng', loại 'Cố định' có thể hiển thị 1 hoặc tổng (tùy logic)
            if (svc.LoaiDichVu === 'Theo số lượng') {
                monthlyQuantity = quantityMap[svc.MaDV] || 0; // Lấy tổng từ map
            } else if (svc.LoaiDichVu === 'Cố định') {
                // Đối với dịch vụ cố định, số lượng có thể là 1 hoặc tổng số ngày đăng ký trong tháng?
                // Hoặc đơn giản là 1 nếu nó được đăng ký.
                // Kiểm tra xem nó có sử dụng trong tháng không?
                monthlyQuantity = (quantityMap[svc.MaDV] !== undefined) ? 1 : 0; // Hiển thị 1 nếu có sử dụng trong tháng
            }
            return {
                TenDV: svc?.TenDV || '',
                LoaiDV: svc?.LoaiDichVu || '',
                Gia: svc?.Gia || 0,
                DonViTinh: svc?.DonViTinh || '',
                SoLuong: monthlyQuantity, // <-- Tổng số lượng trong tháng
                MaDV: svc.MaDV,
                MaPhong: roomId,
                isUtility: false
            };
        });

        // --- 4. Lấy thông tin ghi điện nước gần nhất ---
        // Lấy bản ghi gần nhất cho từng loại 'Điện', 'Nước'
        const latestReadings = await ElectricWater.findAll({ // Sửa thành ElectricWater
            where: { MaPhong: roomId },
            order: [ ['Loai', 'ASC'], ['NgayGhi', 'DESC'] ],
        });

        // Lọc ra bản ghi mới nhất của Điện và Nước từ kết quả trên
        const latestElectricReading = latestReadings.find(r => r.Loai === 'Điện');
        const latestWaterReading = latestReadings.find(r => r.Loai === 'Nước');

        // --- 5. Lấy thông tin cấu hình/đơn giá Điện (1) và Nước (2) ---
        // Giả sử thông tin này nằm trong bảng Service
        const utilityServiceInfo = await Service.findAll({
            where: {
                MaDV: { [Op.in]: [1, 2] } // Lấy thông tin cho MaDV 1 và 2
            },
            attributes: ['MaDV', 'TenDV', 'Gia', 'DonViTinh', 'LoaiDichVu'] // Chỉ lấy các trường cần thiết
        });

        // Tạo map để dễ truy cập thông tin Điện/Nước bằng MaDV
        const utilityInfoMap = utilityServiceInfo.reduce((map, service) => {
            map[service.MaDV] = service;
            return map;
        }, {});

        const electricInfo = utilityInfoMap[1]; // Thông tin cấu hình Điện
        const waterInfo = utilityInfoMap[2];    // Thông tin cấu hình Nước

        // --- 6. Tạo các đối tượng "dịch vụ ảo" cho Điện và Nước ---
        const formattedUtilities = [];

        if (latestElectricReading && electricInfo) {
            const consumption = (latestElectricReading.ChiSoCuoi ?? 0) - (latestElectricReading.ChiSoDau ?? 0);
            formattedUtilities.push({
                TenDV: electricInfo.TenDV || 'Tiền Điện',
                LoaiDV: electricInfo.LoaiDichVu || 'Theo số lượng', // Lấy từ cấu hình
                Gia: electricInfo.Gia || 0, // Đơn giá từ cấu hình
                DonViTinh: electricInfo.DonViTinh || 'kWh', // Đơn vị từ cấu hình
                SoLuong: consumption >= 0 ? consumption : 0, // Số lượng là lượng tiêu thụ
                MaDV: 1, // MaDV cố định cho Điện
                NgayGhi: latestElectricReading.NgayGhi || null, // Ngày ghi chỉ số
                MaPhong: roomId,
                isUtility: true, // Đánh dấu đây là điện nước
                ChiSoDau: latestElectricReading.ChiSoDau, // Thêm chỉ số nếu Frontend cần
                ChiSoCuoi: latestElectricReading.ChiSoCuoi
            });
        }

        if (latestWaterReading && waterInfo) {
            const consumption = (latestWaterReading.ChiSoCuoi ?? 0) - (latestWaterReading.ChiSoDau ?? 0);
            formattedUtilities.push({
                TenDV: waterInfo.TenDV || 'Tiền Nước',
                LoaiDV: waterInfo.LoaiDichVu || 'Theo số lượng',
                Gia: waterInfo.Gia || 0,
                DonViTinh: waterInfo.DonViTinh || 'm³',
                SoLuong: consumption >= 0 ? consumption : 0,
                MaDV: 2, // MaDV cố định cho Nước
                NgayGhi: latestWaterReading.NgayGhi || null,
                MaPhong: roomId,
                isUtility: true,
                ChiSoDau: latestWaterReading.ChiSoDau,
                ChiSoCuoi: latestWaterReading.ChiSoCuoi
            });
        }

        // --- 6. Kết hợp danh sách ---
        // Đưa Điện Nước lên đầu danh sách cho dễ thấy
        const combinedList = [...formattedUtilities, ...formattedRegularServices];

        // --- 7. Trả về kết quả ---
        // Kiểm tra nếu danh sách cuối cùng trống rỗng
        if (combinedList.length === 0) {
             // Bạn có thể trả về mảng rỗng thay vì 404 nếu muốn frontend tự xử lý
             // return res.status(404).json({ message: "Không tìm thấy dịch vụ hoặc chỉ số điện nước nào cho phòng này." });
             return res.json([]); // Trả về mảng rỗng
        }

        res.json(combinedList);

    } catch (err) {
        console.error("Lỗi lấy dịch vụ phòng (bao gồm điện nước):", err);
        // Trả về lỗi chung cho client
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách dịch vụ phòng." });
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
    const t = await sequelize.transaction();
    try {
        const { roomId, serviceId } = req.params;

        if (!roomId || !serviceId) {
            await t.rollback();
            return res.status(400).json({ message: "Thiếu Mã phòng hoặc Mã dịch vụ." });
        }
        // Bạn có thể muốn thêm kiểm tra xem dịch vụ này có phải loại Cố định hay không
        // và chỉ cho phép xóa loại Cố định chẳng hạn.

        // Xóa TẤT CẢ các bản ghi liên quan đến dịch vụ này và phòng này trong DichVuPhong
        // Điều này có nghĩa là hủy đăng ký dịch vụ đó cho phòng.
        const deletedRowCount = await RoomService.destroy({
            where: {
                MaPhong: roomId,
                MaDV: serviceId
                // KHÔNG thêm NgaySuDung để xóa tất cả các ngày
            },
            transaction: t
        });

        if (deletedRowCount > 0) {
            await t.commit();
            res.status(200).json({ message: `Đã hủy đăng ký dịch vụ (MaDV: ${serviceId}) khỏi phòng thành công.` });
        } else {
            await t.rollback(); // Không có gì để xóa, rollback cho chắc
            res.status(404).json({ message: "Không tìm thấy đăng ký dịch vụ này cho phòng để xóa." });
        }

    } catch (error) {
        await t.rollback();
        console.error("Lỗi khi hủy đăng ký dịch vụ phòng:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi hủy đăng ký dịch vụ." });
    }
};
    


exports.upsertRoomServices = async (req, res) => {
    const servicesPayload = req.body; // Expects an array from frontend

    if (!Array.isArray(servicesPayload) || servicesPayload.length === 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ: Yêu cầu một mảng các dịch vụ." });
    }

    // Use a transaction
    const t = await sequelize.transaction();

    try {
        const results = [];
        const errors = [];

        for (const item of servicesPayload) {
            const { MaPhong, MaDV, SoLuong, NgaySuDung } = item;

            // Basic validation for each item inside the loop
            if (MaPhong === undefined || MaPhong === null || MaDV === undefined || MaDV === null || SoLuong === undefined || SoLuong === null || isNaN(Number(SoLuong)) || Number(SoLuong) <= 0 || !NgaySuDung || !/^\d{4}-\d{2}-\d{2}$/.test(NgaySuDung)) {
                console.warn(`Skipping invalid item:`, item);
                errors.push(`Dữ liệu không hợp lệ cho dịch vụ MaDV ${MaDV || 'unknown'}`);
                continue; // Skip this item
            }

            try {
                // Perform upsert: inserts if not exist, updates if exists (based on unique constraints)
                // Assumes unique constraint on (MaPhong, MaDV, NgaySuDung) or similar primary key
                const [record, created] = await RoomService.upsert(
                    {
                        MaPhong: MaPhong,
                        MaDV: MaDV,
                        SoLuong: Number(SoLuong),
                        NgaySuDung: NgaySuDung,
                        // Add any other fields required by your Phong_DichVu model here
                    },
                    {
                        transaction: t,
                        // If using upsert without primary key/unique constraint match,
                        // you might need returning: true or other options depending on dialect/version
                    }
                );
                results.push({ MaDV: MaDV, created: created, record: record }); // Record might be null depending on DB/options
            } catch (upsertError) {
                console.error(`Lỗi khi upsert dịch vụ MaDV ${MaDV} cho phòng ${MaPhong}:`, upsertError);
                errors.push(`Lỗi xử lý dịch vụ MaDV ${MaDV}: ${upsertError.message}`);
                // Decide if one error should rollback the whole transaction
                // throw upsertError; // Uncomment to rollback immediately on first error
            }
        }

        // If any errors occurred but we didn't throw, commit the successful ones but report errors
        if (errors.length > 0) {
             await t.commit(); // Commit successful operations
             return res.status(207).json({ // 207 Multi-Status might be appropriate
                  message: `Đã xử lý xong. Có ${errors.length} lỗi xảy ra.`,
                  successCount: results.length,
                  errors: errors
             });
        }

        // If all successful, commit transaction
        await t.commit();
        res.status(200).json({ // Use 200 OK for successful upsert mix
             message: `Đã thêm/cập nhật thành công ${results.length} dịch vụ.`,
             // data: results // Optionally return details about created/updated
        });

    } catch (error) {
        // If any error caused an early exit or commit failed
        await t.rollback();
        console.error("Lỗi transaction khi thêm/cập nhật dịch vụ phòng:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi thêm/cập nhật dịch vụ.", error: error.message });
    }
};

exports.addServiceUsage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { maPhong, maDv, soLuong } = req.body;
        const today = format(new Date(), 'yyyy-MM-dd'); // Lấy ngày hôm nay dạng YYYY-MM-DD

        // --- Validation ---
        if (!maPhong || !maDv || !soLuong) {
            await t.rollback();
            return res.status(400).json({ message: "Thiếu thông tin MaPhong, MaDV hoặc SoLuong." });
        }
        const quantity = parseInt(soLuong, 10);
        if (isNaN(quantity) || quantity <= 0) {
            await t.rollback();
            return res.status(400).json({ message: "Số lượng không hợp lệ (phải là số nguyên > 0)." });
        }

        // --- Tìm hoặc Tạo bản ghi cho ngày hôm nay ---
        const [record, created] = await RoomService.findOrCreate({
            where: {
                MaPhong: maPhong,
                MaDV: maDv,
                NgaySuDung: today
            },
            defaults: {
                SoLuong: quantity // Nếu tạo mới, số lượng ban đầu là quantity
            },
            transaction: t
        });

        // --- Nếu bản ghi đã tồn tại, cộng dồn số lượng ---
        if (!created) {
            // Sử dụng increment để cộng dồn một cách an toàn
            await record.increment('SoLuong', { by: quantity, transaction: t });
        }

        // --- Commit transaction ---
        await t.commit();

        // Lấy lại bản ghi đã cập nhật/tạo để trả về (tùy chọn)
        const finalRecord = await RoomService.findOne({
             where: { MaPhong: maPhong, MaDV: maDv, NgaySuDung: today }
        });


        res.status(201).json({ // Dùng 201 (Created) hoặc 200 (OK) đều được
             message: "Đã cập nhật/thêm số lượng sử dụng thành công.",
             record: finalRecord // Trả về bản ghi cuối cùng
        });

    } catch (error) {
        await t.rollback();
        console.error("Lỗi khi cập nhật/thêm số lượng sử dụng hàng ngày:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xử lý yêu cầu." });
    }
};

exports.addRoomServices = async (req, res) => {
    const payload = req.body; // payload là một MẢNG các object { MaPhong, MaDV, SoLuong, NgaySuDung }
    const t = await sequelize.transaction();
    const today = format(new Date(), 'yyyy-MM-dd');
    const results = { created: [], updated: [], failed: [] }; // Để theo dõi kết quả (tùy chọn)

    // --- Validation cơ bản ---
    if (!Array.isArray(payload)) {
        return res.status(400).json({ message: "Payload không hợp lệ, phải là một mảng." });
    }
    if (payload.length === 0) {
        // Có thể chấp nhận payload rỗng (không làm gì) hoặc báo lỗi tùy logic
         return res.status(200).json({ message: "Không có dịch vụ nào được chọn để xử lý." });
        // return res.status(400).json({ message: "Không có dịch vụ nào được chọn." });
    }

    try {
        // Lấy danh sách giá cho các MaDV cần xử lý (tối ưu hơn gọi trong loop)
        const serviceIds = payload.map(item => item.MaDV);
        const servicePrices = await Service.findAll({
            where: { MaDV: serviceIds },
            attributes: ['MaDV', 'Gia'],
            raw: true,
            transaction: t
        });
        const priceMap = servicePrices.reduce((map, service) => {
            map[service.MaDV] = service.Gia;
            return map;
        }, {});


        // --- Xử lý từng dịch vụ trong payload ---
        for (const item of payload) {
            const { MaPhong, MaDV, SoLuong } = item; // NgaySuDung từ payload có thể bỏ qua, dùng today

            // Validation từng item
            if (!MaPhong || !MaDV || SoLuong === undefined || isNaN(Number(SoLuong)) || Number(SoLuong) <= 0) {
                console.warn(`Bỏ qua item không hợp lệ:`, item);
                results.failed.push({ MaDV: MaDV, reason: 'Dữ liệu không hợp lệ' });
                continue; // Bỏ qua item này và xử lý item tiếp theo
            }

            const quantity = Number(SoLuong);
            const currentPrice = priceMap[MaDV]; // Lấy giá đã fetch

             if (currentPrice === undefined) {
                 console.warn(`Không tìm thấy giá cho MaDV=${MaDV}, bỏ qua.`);
                 results.failed.push({ MaDV: MaDV, reason: 'Không tìm thấy đơn giá' });
                 continue;
             }


            // Thực hiện FindOrCreate cho ngày HÔM NAY
            // Nó sẽ tạo nếu (MaPhong, MaDV, today) chưa có, hoặc tìm thấy nếu đã có.
            const [record, created] = await RoomService.findOrCreate({
                where: {
                    MaPhong: MaPhong,
                    MaDV: MaDV,
                    NgaySuDung: today // Luôn dùng ngày hôm nay
                },
                defaults: {
                    SoLuong: quantity,
                    DonGiaTaiThoiDiem: currentPrice // Lưu giá nếu tạo mới
                    // Thêm các trường khác nếu cần
                },
                transaction: t
            });

            if (created) {
                results.created.push({ MaDV: MaDV, MaPhong: MaPhong, NgaySuDung: today, SoLuong: quantity });
            } else {
                // Nếu tìm thấy (created = false), bản ghi đã tồn tại cho ngày hôm nay.
                // Theo yêu cầu "thêm vào khi tick mới", chúng ta không cần làm gì ở đây.
                // Nếu muốn cập nhật số lượng nếu bản ghi đã tồn tại, thêm logic update ở đây:
                // record.SoLuong = quantity; // Ghi đè số lượng?
                // record.DonGiaTaiThoiDiem = currentPrice; // Cập nhật giá?
                // await record.save({ transaction: t });
                // results.updated.push({ MaDV: MaDV, MaPhong: MaPhong, NgaySuDung: today, SoLuong: quantity });
            }
        } // Kết thúc vòng lặp for

        // --- Commit transaction ---
        await t.commit();

        // --- Trả về kết quả ---
        // Có thể trả về chi tiết hơn nếu cần (dùng results)
        if (results.failed.length > 0 && results.created.length === 0 && results.updated.length === 0) {
             // Nếu tất cả đều lỗi
             res.status(400).json({ message: "Tất cả các mục dịch vụ đều không hợp lệ hoặc có lỗi.", errors: results.failed });
        } else if (results.failed.length > 0) {
             // Nếu có thành công và có lỗi (Partial success)
             res.status(207).json({ // 207 Multi-Status
                 message: "Đã xử lý, nhưng một số mục gặp lỗi.",
                 created: results.created,
                 updated: results.updated,
                 errors: results.failed
             });
        }
         else {
             // Nếu tất cả thành công
             res.status(200).json({ message: "Các dịch vụ đã được thêm/cập nhật thành công."/*, created: results.created, updated: results.updated */ });
         }


    } catch (error) {
        await t.rollback();
        console.error("Lỗi khi upsert dịch vụ phòng:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xử lý dịch vụ phòng." });
    }
};