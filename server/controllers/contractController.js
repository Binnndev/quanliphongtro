const { Contract, Tenant } = require("../models");
const fs = require('fs'); // Để xử lý file
const path = require('path'); // Để xử lý đường dẫn
const { Op } = require("sequelize"); // Để sử dụng các toán tử so sánh trong Sequelize
const cron = require('node-cron');

console.log('⏰ Contract Expiry Scheduler initialized.');

// Hàm thực hiện kiểm tra và cập nhật
const checkAndExpireContracts = async () => {
    console.log(`⏰ [${new Date().toISOString()}] Running contract expiry check...`);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Chỉ so sánh ngày, bỏ qua giờ phút giây

    try {
        // Tìm tất cả hợp đồng đang 'Đang hiệu lực' và có NgayKetThuc < hôm nay
        const expiredContracts = await Contract.findAll({
            where: {
                TrangThai: 'Có hiệu lực', // Chỉ kiểm tra các HĐ đang hiệu lực
                NgayKetThuc: {
                    [Op.lt]: today // Ngày kết thúc nhỏ hơn ngày hôm nay
                }
            }
        });

        if (expiredContracts.length > 0) {
            console.log(`⏰ Found ${expiredContracts.length} contracts to mark as expired.`);
            const idsToExpire = expiredContracts.map(c => c.MaHopDong);

            // Cập nhật trạng thái cho các hợp đồng tìm thấy
            const [updateCount] = await Contract.update(
                { TrangThai: 'Hết hiệu lực' }, // Cập nhật trạng thái mới
                { where: { MaHopDong: idsToExpire } }
            );
            console.log(`✅ Successfully marked ${updateCount} contracts as expired.`);
        } else {
            console.log(`✅ No contracts found requiring expiration update.`);
        }

    } catch (error) {
        console.error('❌ Error during contract expiry check:', error);
    }
};

// Lên lịch chạy công việc hàng ngày vào lúc 00:05 (5 phút sau nửa đêm)
// Cú pháp cron: 'phút giờ ngày tháng thứ' (* là bất kỳ)
// '5 0 * * *' : Chạy vào 00:05 mỗi ngày
cron.schedule('5 0 * * *', () => {
    checkAndExpireContracts();
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" // Đặt múi giờ phù hợp
});

// 🟢 Lấy danh sách hợp đồng (Có thể giữ nguyên hoặc thêm filter nếu cần)
exports.getAllContracts = async (req, res) => {
    try {
        const contracts = await Contract.findAll(); // Có thể thêm { where: { TrangThai: 'Đang hiệu lực' } } nếu muốn
        res.json(contracts);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin hợp đồng theo ID
exports.getContractById = async (req, res) => {
    try {
        const contract = await Contract.findByPk(req.params.id);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }
        res.json(contract);
    } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin hợp đồng:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Lấy thông tin hợp đồng THEO PHÒNG (Ưu tiên hợp đồng mới nhất/đang hiệu lực)
exports.getContractByRoom = async (req, res) => {
    try {
        // Tìm hợp đồng mới nhất (dựa vào ngày tạo hoặc ngày bắt đầu)
        // và chưa bị hủy cho phòng này
        const contract = await Contract.findOne({
            where: {
                MaPhong: req.params.roomId
                // *** BỎ LỌC TRẠNG THÁI Ở ĐÂY ***
                // TrangThai: {
                //     [Op.ne]: 'Đã hủy' // <= BỎ DÒNG NÀY
                // }
            },
            order: [
                 ['NgayBatDau', 'DESC'] // Lấy HĐ có ngày bắt đầu gần nhất
                 // Hoặc ['createdAt', 'DESC']
            ]
        });

        // Quan trọng: Trả về 404 nếu không có hợp đồng nào (kể cả cũ) hoặc không có HĐ đang hoạt động
        // Frontend sẽ dựa vào 404 để biết là cần "Thêm mới"
        if (!contract) {
             // Không log lỗi ở đây vì đây là trường hợp hợp lệ (phòng chưa có HĐ)
             console.log(`ℹ️ Không tìm thấy hợp đồng phù hợp cho phòng ID: ${req.params.roomId}`);
            return res.status(404).json({ message: "Không tìm thấy hợp đồng phù hợp cho phòng này" });
        }

        // Trả về hợp đồng tìm thấy (có thể là đang hiệu lực, hết hạn, nhưng chưa hủy)
        res.json(contract);

    } catch (error) {
        console.error(`❌ Lỗi khi lấy thông tin hợp đồng cho phòng ID ${req.params.roomId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin hợp đồng." });
    }
};

// 🟢 Thêm hợp đồng mới (Lưu file vào trường FileHopDong)
exports.createContract = async (req, res) => {
    try {
        console.log("📌 Dữ liệu body nhận được khi thêm HĐ:", req.body);
        console.log("📁 File nhận được khi thêm HĐ:", req.file);

        const { MaPhong, NgayLap, NgayBatDau, NgayKetThuc, TienCoc, TrangThai, MaKhachThue } = req.body;

        // Validation cơ bản
        // if (!MaPhong || !NgayBatDau || !NgayKetThuc || !MaKhachThue) {
        //     if (req.file) fs.unlinkSync(req.file.path);
        //     return res.status(400).json({ message: "Thiếu thông tin Mã phòng, Ngày bắt đầu hoặc Ngày kết thúc." });
        // }

        if (!MaPhong)
            return res.status(400).json({ message: "Thiếu thông tin Mã phòng." });
        if (!NgayBatDau)
            return res.status(400).json({ message: "Thiếu thông tin Ngày bắt đầu." });
        if (!NgayKetThuc)
            return res.status(400).json({ message: "Thiếu thông tin Ngày kết thúc." });
        if (!MaKhachThue)
            return res.status(400).json({ message: "Thiếu thông tin Mã người thuê." });
        
        const tenantExists = await Tenant.findByPk(MaKhachThue);
        if (!tenantExists) {
             if (req.file) fs.unlinkSync(req.file.path);
             return res.status(400).json({ message: `Mã người thuê chính (${MaKhachThue}) không tồn tại.` });
        }

        let contractFileName = req.file ? req.file.filename : null;
        console.log("💾 Tên file hợp đồng sẽ lưu:", contractFileName);

        const newContractData = {
            MaPhong,
            NgayLap: NgayLap ? new Date(NgayLap) : new Date(),
            NgayBatDau: new Date(NgayBatDau),
            NgayKetThuc: new Date(NgayKetThuc),
            TienCoc: TienCoc || 0,
            TrangThai: 'Có hiệu lực',
            MaKhachThue,
            FileHopDong: contractFileName
        };

        const contract = await Contract.create(newContractData);
        console.log("✅ Thêm hợp đồng thành công, ID:", contract.MaHopDong);
        res.status(201).json({ message: "Thêm hợp đồng thành công", contract });

    } catch (error) {
        console.error("❌ Lỗi khi thêm hợp đồng:", error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => { /* log error */ });
        }
        // ... (xử lý lỗi validation như cũ) ...
        res.status(500).json({ message: "Lỗi máy chủ khi thêm hợp đồng." });
    }
};


// 🟢 Cập nhật thông tin hợp đồng (Lưu file vào trường FileHopDong)
exports.updateContract = async (req, res) => {
    const contractId = req.params.id;
    try {
        const contract = await Contract.findByPk(contractId);
        if (!contract) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }

        console.log("📌 Dữ liệu body nhận được khi cập nhật HĐ:", req.body);
        console.log("📁 File nhận được khi cập nhật HĐ:", req.file);

        // --- Thay đổi: Lấy đường dẫn file cũ từ FileHopDong ---
        const oldFileName = contract.FileHopDong;
        const oldFilePath = oldFileName ? path.join('uploads', oldFileName) : null;
        // --- Kết thúc thay đổi ---

        const updateData = { ...req.body };
        delete updateData.MaPhong; // Không cho cập nhật MaPhong
        delete updateData.MaHopDong; // Không cho cập nhật ID
        delete updateData.MaKhachThue; // Không cho cập nhật MaKhachThue

        // Xử lý ngày tháng
        if (updateData.NgayLap) updateData.NgayLap = new Date(updateData.NgayLap);
        if (updateData.NgayBatDau) updateData.NgayBatDau = new Date(updateData.NgayBatDau);
        if (updateData.NgayKetThuc) updateData.NgayKetThuc = new Date(updateData.NgayKetThuc);

        // Xử lý file mới upload hoặc yêu cầu xóa file cũ
        let shouldDeleteOldFilePhysically = false;
        if (req.file) {
            console.log("🔄 Có file mới thay thế.");
            // --- Thay đổi: Cập nhật FileHopDong ---
            updateData.FileHopDong = req.file.filename;
            // Bỏ các trường cũ nếu không dùng
            // updateData.TenFile = req.file.filename;
            // updateData.KieuFile = req.file.mimetype;
            // updateData.KichThuocFile = req.file.size;
            // --- Kết thúc thay đổi ---
            if (oldFilePath) {
                shouldDeleteOldFilePhysically = true; // Sẽ xóa file cũ sau khi DB update thành công
            }
        } else {
            console.log("🚫 Không có file mới được upload khi cập nhật.");
            // --- Thay đổi: Xử lý yêu cầu xóa file qua FileHopDong ---
            if (updateData.deleteContractFile === 'true') { // Frontend gửi tín hiệu này
                console.log("🗑️ Yêu cầu xóa file cũ.");
                updateData.FileHopDong = null; // Set trường FileHopDong thành null
                if (oldFilePath) {
                     shouldDeleteOldFilePhysically = true; // Sẽ xóa file cũ sau khi DB update thành công
                }
            } else {
                // Không có file mới và không yêu cầu xóa -> Giữ nguyên FileHopDong cũ
                // Xóa FileHopDong khỏi updateData để Sequelize không cố ghi đè nó thành undefined
                delete updateData.FileHopDong;
            }
            // --- Kết thúc thay đổi ---
        }
        delete updateData.deleteContractFile; // Xóa tín hiệu tạm thời khỏi data update

        // Bỏ các trường không dùng nữa nếu đã xóa khỏi model
        // delete updateData.TenFile;
        // delete updateData.KieuFile;
        // delete updateData.KichThuocFile;

        // Loại bỏ các trường undefined nếu có (tránh lỗi)
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        console.log("💾 Dữ liệu chuẩn bị cập nhật HĐ:", updateData);

        // Thực hiện cập nhật DB
        await contract.update(updateData);

        // Xóa file vật lý cũ nếu cần
        if (shouldDeleteOldFilePhysically && oldFilePath) {
             console.log(`🔍 Kiểm tra xóa file vật lý cũ: ${oldFilePath}`);
             fs.access(oldFilePath, fs.constants.F_OK, (err) => {
                 if (!err) {
                     fs.unlink(oldFilePath, (unlinkErr) => {
                         if (unlinkErr) console.error("❌ Lỗi khi xóa file vật lý cũ:", unlinkErr);
                         else console.log("🗑️ Đã xóa file vật lý cũ:", oldFilePath);
                     });
                 } else {
                     console.warn("⚠️ Không tìm thấy file vật lý cũ để xóa:", oldFilePath);
                 }
             });
         }

        // Lấy lại dữ liệu sau khi cập nhật
        const updatedContract = await Contract.findByPk(contractId);
        res.json({ message: "Cập nhật hợp đồng thành công", contract: updatedContract });

    } catch (error) {
        console.error(`❌ Lỗi khi cập nhật hợp đồng ID ${contractId}:`, error);
         if (req.file) {
             fs.unlink(req.file.path, (err) => { /* log error */ });
         }
         // ... (xử lý lỗi validation như cũ) ...
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật hợp đồng." });
    }
};

// 🟢 Hủy hợp đồng (Cập nhật trạng thái)
exports.terminateContract = async (req, res) => {
    const contractId = req.params.id;
    try {
        const contract = await Contract.findByPk(contractId);
        if (!contract) {
            return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        }

        // Chỉ cập nhật trạng thái, có thể thêm ngày hủy nếu cần
        await contract.update({
             TrangThai: 'Đã hủy',
             // NgayHuy: new Date() // Thêm cột này nếu cần
        });

        console.log(`✅ Đã hủy hợp đồng ID: ${contractId}`);
        const updatedContract = await Contract.findByPk(contractId); // Lấy lại để trả về trạng thái mới
        console.log('[DEBUG] Backend - Data trả về sau khi hủy:', updatedContract);
        res.json({ message: "Hủy hợp đồng thành công", contract: updatedContract });

    } catch (error) {
        console.error(`❌ Lỗi khi hủy hợp đồng ID ${contractId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi hủy hợp đồng." });
    }
};

// 🟢 Tải file hợp đồng
exports.downloadContractFile = async (req, res) => {
    const contractId = req.params.MaHopDong || req.params.id; // Lấy ID từ params
    console.log("📁 Yêu cầu tải file hợp đồng ID:", contractId);
    try {
        const contract = await Contract.findByPk(contractId);
        if (!contract || !contract.FileHopDong) { // Kiểm tra có hợp đồng và có tên file không
            return res.status(404).json({ message: "Không tìm thấy hợp đồng hoặc hợp đồng không có file đính kèm." });
        }

        const fileName = contract.FileHopDong;
        // Đường dẫn tới file trên server (giả sử lưu trong thư mục 'uploads' cùng cấp với thư mục chạy code)
        const filePath = path.join(__dirname, '..', 'uploads/contracts', fileName); // Đi lên 1 cấp rồi vào 'uploads'

        console.log(`⬇️ Chuẩn bị tải file: ${fileName} từ đường dẫn: ${filePath}`);

        // Kiểm tra file tồn tại trước khi gửi
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error("❌ Không tìm thấy file trên server:", filePath);
                return res.status(404).json({ message: "Không tìm thấy file hợp đồng trên máy chủ." });
            }

            // Gửi file cho client tải xuống, tự động set header Content-Disposition
            res.download(filePath, fileName, (downloadErr) => {
                if (downloadErr) {
                     // Lỗi này thường xảy ra nếu header đã được gửi hoặc có vấn đề về mạng/stream
                    console.error("❌ Lỗi trong quá trình gửi file tải xuống:", downloadErr);
                     // Không cần gửi response lỗi ở đây nữa vì header có thể đã được gửi một phần
                } else {
                    console.log(`✅ Đã gửi file ${fileName} để tải xuống.`);
                }
            });
        });

    } catch (error) {
        console.error(`❌ Lỗi khi xử lý tải file cho hợp đồng ID ${contractId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi xử lý yêu cầu tải file." });
    }
};

// 🟥 Bỏ các hàm không dùng nữa (deleteContract, renewContract, endContract)
// exports.deleteContract = ...
// exports.renewContract = ...
// exports.endContract = ...

// 🟢 Các hàm get khác có thể giữ lại nếu cần
// exports.getContractByGuestId = ...
// exports.getContractByRoomId = ... // Lưu ý: khác getContractByRoom, cái này trả về MẢNG