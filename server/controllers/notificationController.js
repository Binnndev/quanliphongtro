// controllers/notificationController.js

// --- Imports ---
// Import User model instead of Tenant for associations
const { Notification, TaiKhoan, Tenant, Landlord, Sequelize } = require("../models");
const { Op } = Sequelize;

// --- Controller Functions ---

// 🟢 Tạo thông báo mới
exports.createNotification = async (req, res) => {
    try {
        // MaNguoiGui and MaNguoiNhan should now be MaTK (Account IDs) from frontend
        const { MaNguoiGui, MaNguoiNhan, TieuDe, NoiDung } = req.body;

        // --- Validation ---
        if (!MaNguoiGui || !MaNguoiNhan || !TieuDe || !NoiDung) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Người gửi, Người nhận, Tiêu đề, Nội dung)." });
        }

        // Check if sender/receiver User accounts exist using MaTK
        const senderExists = await TaiKhoan.findByPk(MaNguoiGui);
        const receiverExists = await TaiKhoan.findByPk(MaNguoiNhan);
        if (!senderExists || !receiverExists) {
            return res.status(400).json({ message: "Tài khoản Người gửi hoặc Người nhận không hợp lệ." });
        }
        // --- End Validation ---

        const newNotificationData = {
            MaNguoiGui,     // Stores Sender's MaTK
            MaNguoiNhan,    // Stores Receiver's MaTK
            TieuDe,
            NoiDung,
            ThoiGian: new Date(),
            DaDoc: false
        };

        const notification = await Notification.create(newNotificationData);
        console.log("✅ Tạo thông báo thành công, ID:", notification.MaThongBao);

        // TODO: Real-time notification logic (e.g., Socket.IO)
        // if (req.io) { // Check if io object is attached to req
        //     req.io.to(`user_${MaNguoiNhan}`).emit('new_notification', notification); // Emit to receiver's MaTK room
        // }

        // Fetch the notification again with sender info to return
        const createdNotification = await Notification.findByPk(notification.MaThongBao, {
            include: [{
                model: TaiKhoan,
                as: 'SenderAccount', // Use the correct alias
                attributes: ['MaTK'] // Include desired User attributes (adjust as needed)
            }]
        });

        res.status(201).json({ message: "Tạo thông báo thành công", notification: createdNotification });

    } catch (error) {
        console.error("❌ Lỗi khi tạo thông báo:", error);
         if (error.name === 'SequelizeValidationError') {
             return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
         }
        res.status(500).json({ message: "Lỗi máy chủ khi tạo thông báo." });
    }
};

// 🟢 Lấy danh sách thông báo cho người nhận (User ID = MaTK) - CÓ TÌM KIẾM
exports.getNotificationsForUser = async (req, res) => {
    const userId = req.params.userId; // MaTK người nhận
    const limit = parseInt(req.query.limit) || 10; // Lấy limit từ query, mặc định 10
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const readStatus = req.query.read; // Filter đã đọc/chưa đọc
    const searchTerm = req.query.search; // Lấy từ khóa tìm kiếm

    try {
        // --- Xây dựng điều kiện Where động ---
        const whereCondition = { MaNguoiNhan: userId }; // Luôn lọc theo người nhận

        // Thêm filter trạng thái Đã đọc/Chưa đọc
        if (readStatus === 'true') {
            whereCondition.DaDoc = true;
        } else if (readStatus === 'false') {
            whereCondition.DaDoc = false;
        }

        // Thêm điều kiện tìm kiếm nếu có searchTerm
        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`;
            const searchConditions = {
                [Op.or]: [
                    { TieuDe: { [Op.like]: searchPattern } },
                    { NoiDung: { [Op.like]: searchPattern } }
                    // Có thể thêm tìm kiếm theo tên người gửi nếu cần (join phức tạp hơn)
                ]
            };
             // Kết hợp điều kiện người nhận VÀ điều kiện tìm kiếm
            whereCondition[Op.and] = [
                // Giữ lại các điều kiện cũ nếu có (ví dụ DaDoc)
                ...(Object.keys(whereCondition).map(key => ({ [key]: whereCondition[key] }))),
                 searchConditions // Thêm điều kiện OR cho search
            ];
             // Xóa các key gốc đã được đưa vào Op.and để tránh trùng lặp
             if (readStatus !== undefined) delete whereCondition.DaDoc;
              console.log("Search condition for received:", whereCondition);

        } else {
            // Nếu không tìm kiếm, đảm bảo cấu trúc where vẫn đúng
             const existingConditions = { ...whereCondition }; // Copy điều kiện hiện có
             whereCondition[Op.and] = [existingConditions]; // Đặt vào Op.and
              if (readStatus !== undefined) delete whereCondition.DaDoc; // Xóa key gốc
              delete whereCondition.MaNguoiNhan; // Xóa key gốc
        }
       // --- Kết thúc xây dựng Where ---


        const { count, rows: notifications } = await Notification.findAndCountAll({
            where: whereCondition, // Áp dụng điều kiện đã xây dựng
            limit: limit,
            offset: offset,
            order: [['ThoiGian', 'DESC']],
            include: [{ // Include để lấy tên người gửi (nếu cần)
                 model: TaiKhoan,
                 as: 'SenderAccount', // Alias của người gửi
                 attributes: ['MaTK', 'TenDangNhap'],
                 required: false, // LEFT JOIN
                 include: [
                    {
                        model: Tenant,
                        attributes: ['HoTen'],
                        required: false // Dùng false để không loại bỏ kết quả nếu không có thông tin Tenant
                    },
                    {
                        model: Landlord, // <<== THÊM MODEL LANDLORD
                        attributes: ['HoTen'],
                        required: false // Dùng false để không loại bỏ kết quả nếu không có thông tin Landlord
                    }
                ]
            }],
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        // Xử lý lấy tên người gửi (TÙY CHỌN - nếu bạn muốn hiển thị tên người gửi)
         const formattedNotifications = notifications.map(noti => {
             const rawNoti = noti.get({ plain: true });
             let senderName = rawNoti.SenderAccount?.TenDangNhap || `MaTK ${rawNoti.MaNguoiGui}`;
            // Logic tương tự như lấy RecipientName ở getSentNotifications nếu bạn include Tenant/Landlord
            if (rawNoti.SenderAccount?.Tenants?.[0].HoTen) {
                senderName = rawNoti.SenderAccount.Tenants[0].HoTen;
            } else if (rawNoti.SenderAccount?.Landlords?.[0].HoTen) { // <<== KIỂM TRA THÊM LANDLORD
                senderName = rawNoti.SenderAccount.Landlords[0].HoTen;
            }
             return { ...rawNoti, SenderName: senderName }; // Thêm SenderName
         });

        console.log(`✅ Fetched ${notifications.length}/${count} notifications for User ${userId} matching search "${searchTerm}". Page ${page}/${totalPages}.`);
        res.json({
            message: "Lấy danh sách thông báo thành công",
            // data: rows, // Trả về dữ liệu gốc nếu không cần format tên người gửi
            data: formattedNotifications, // Trả về dữ liệu đã format
            pagination: { totalItems: count, totalPages, currentPage: page, limit }
        });

    } catch (error) {
        console.error(`❌ Error fetching notifications for User (MaTK) ${userId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách thông báo." });
    }
};

// Controller mới để lấy lịch sử đã gửi
exports.getSentNotifications = async (req, res) => {
    const senderId = req.params.senderId;
    const limit = parseInt(req.query.limit) || 10; // Sử dụng limit từ query hoặc mặc định
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search; // Lấy từ khóa tìm kiếm

    if (!senderId) {
        return res.status(400).send({ message: "Thiếu ID người gửi." });
    }

    try {
        // --- Xây dựng điều kiện Where động ---
        const whereCondition = { MaNguoiGui: senderId };

        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`; // Pattern cho LIKE
            // Tìm kiếm trong Tiêu đề HOẶC Nội dung
            // Lưu ý: Op.iLike chỉ hoạt động trên PostgreSQL cho case-insensitive
            // Dùng Op.like và LOWER() cho tương thích rộng hơn
            whereCondition[Op.or] = [
                { TieuDe: { [Op.like]: searchPattern } },
                { NoiDung: { [Op.like]: searchPattern } }
                // Tìm kiếm tên người nhận phức tạp hơn, tạm bỏ qua ở bước này
                // Nếu muốn tìm cả tên người nhận, cần join phức tạp hơn hoặc dùng full-text search
            ];
             console.log("Search condition:", whereCondition[Op.or]);
        }
        // ------------------------------------

        // Sử dụng findAndCountAll để hỗ trợ phân trang và tìm kiếm
        const { count, rows: notifications } = await Notification.findAndCountAll({
            where: whereCondition, // Áp dụng điều kiện tìm kiếm
            include: [
                {
                    model: TaiKhoan,
                    as: 'ReceiverAccount',
                    attributes: ['MaTK', 'TenDangNhap'], // Có thể thêm LoaiTaiKhoan nếu cần dùng trực tiếp
                    include: [
                        {
                            model: Tenant,
                            attributes: ['HoTen'],
                            required: false // Dùng false để không loại bỏ kết quả nếu không có thông tin Tenant
                        },
                        {
                            model: Landlord, // <<== THÊM MODEL LANDLORD
                            attributes: ['HoTen'],
                            required: false // Dùng false để không loại bỏ kết quả nếu không có thông tin Landlord
                        }
                    ]
                }
            ],
            order: [['ThoiGian', 'DESC']],
            limit: limit,
            offset: offset,
            distinct: true, // Cần thiết khi include và limit/offset để count chính xác
        });

        const totalPages = Math.ceil(count / limit);

        // Xử lý để lấy tên người nhận một cách nhất quán (giữ nguyên)
        const formattedNotifications = notifications.map(noti => {
            const rawNoti = noti.get({ plain: true });
            let recipientName = rawNoti.ReceiverAccount?.TenDangNhap || `MaTK ${rawNoti.MaNguoiNhan}`; // Giá trị mặc định
        
            // Ưu tiên lấy HoTen từ TenantInfo hoặc LandlordInfo nếu có
            if (rawNoti.ReceiverAccount?.Tenants?.[0].HoTen) {
                recipientName = rawNoti.ReceiverAccount.Tenants[0].HoTen;
            } else if (rawNoti.ReceiverAccount?.Landlords?.[0].HoTen) { // <<== KIỂM TRA THÊM LANDLORD
                recipientName = rawNoti.ReceiverAccount.Landlords[0].HoTen;
            }
            // Bạn có thể thêm các else if khác nếu có nhiều loại tài khoản với tên riêng
        
            return { ...rawNoti, RecipientName: recipientName }; // Giữ lại các trường khác và thêm RecipientName đã format
        });

         console.log(`✅ Found ${count} sent notifications for sender ${senderId} matching search "${searchTerm}". Returning page ${page}/${totalPages}.`);
        res.status(200).json({
             message: "Lấy lịch sử thông báo thành công",
             data: formattedNotifications,
             pagination: { totalItems: count, totalPages, currentPage: page, limit } // Trả về thông tin phân trang
         });

    } catch (error) {
        console.error(`Error fetching sent notifications for sender MaTK ${senderId}:`, error);
        res.status(500).send({ message: "Lỗi lấy lịch sử thông báo." });
    }
};


// 🟢 Lấy thông báo theo ID của nó
exports.getNotificationById = async (req, res) => {
    const notificationId = req.params.id;
    try {
        const notification = await Notification.findByPk(notificationId, {
             include: [
                 { model: TaiKhoan, as: 'SenderAccount', attributes: ['MaTK'] }, // Use User model and correct alias
                 { model: TaiKhoan, as: 'ReceiverAccount', attributes: ['MaTK'] } // Use User model and correct alias
             ]
        });
        if (!notification) {
            return res.status(404).json({ message: "Không tìm thấy thông báo" });
        }
        // TODO: Add authorization check if needed
        console.log(`✅ Lấy thông báo ID: ${notificationId}`);
        res.json(notification);
    } catch (error) {
        console.error(`❌ Lỗi khi lấy thông báo ID ${notificationId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy thông tin thông báo." });
    }
};

// 🟢 Đánh dấu đã đọc cho 1 thông báo
exports.markAsRead = async (req, res) => {
    const notificationId = req.params.id;
    // Assume authentication middleware adds user info (including MaTK) to req.user
    // const requestingUserId = req.user?.MaTK;

    try {
        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Không tìm thấy thông báo" });
        }

        // Authorization check: Ensure the requester is the receiver
        // if (!requestingUserId || notification.MaNguoiNhan !== requestingUserId) {
        //     return res.status(403).json({ message: "Không có quyền đánh dấu thông báo này." });
        // }

        if (notification.DaDoc) {
            console.log(`ℹ️ Thông báo ID ${notificationId} đã được đọc trước đó.`);
             return res.json({ message: "Thông báo đã được đọc", notification });
        }

        await notification.update({ DaDoc: true });

        console.log(`✅ Đánh dấu đã đọc cho thông báo ID: ${notificationId}`);
        const updatedNotification = await Notification.findByPk(notificationId, {
             include: [{ model: TaiKhoan, as: 'SenderAccount', attributes: ['MaTK'] }] // Include sender info in response
        });
        res.json({ message: "Đánh dấu đã đọc thành công", notification: updatedNotification });

    } catch (error) {
        console.error(`❌ Lỗi khi đánh dấu đã đọc cho thông báo ID ${notificationId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi đánh dấu đã đọc." });
    }
};

// 🟢 Đánh dấu tất cả là đã đọc cho một user (User ID = MaTK)
exports.markAllAsRead = async (req, res) => {
    const userId = req.params.userId; // This is MaTK
    // const requestingUserId = req.user?.MaTK;

    // Authorization check
    // if (!requestingUserId || String(userId) !== String(requestingUserId)) {
    //      return res.status(403).json({ message: "Không có quyền thực hiện hành động này." });
    // }

    try {
        const [updateCount] = await Notification.update(
            { DaDoc: true },
            {
                where: {
                    MaNguoiNhan: userId, // Filter by Receiver's MaTK
                    DaDoc: false
                }
            }
        );

        console.log(`✅ Đã đánh dấu ${updateCount} thông báo là đã đọc cho User (MaTK): ${userId}`);
        res.json({ message: `Đã đánh dấu ${updateCount} thông báo là đã đọc.` });

    } catch (error) {
        console.error(`❌ Lỗi khi đánh dấu tất cả đã đọc cho User (MaTK) ${userId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi đánh dấu tất cả đã đọc." });
    }
};


// 🟢 Xóa một thông báo
exports.deleteNotification = async (req, res) => {
    const notificationId = req.params.id;
    // const requestingUserId = req.user?.MaTK;

    try {
        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Không tìm thấy thông báo" });
        }

        // Authorization check (e.g., only receiver or admin can delete)
        // if (!requestingUserId || (notification.MaNguoiNhan !== requestingUserId /* && !req.user.isAdmin */)) {
        //      return res.status(403).json({ message: "Không có quyền xóa thông báo này." });
        // }

        await notification.destroy(); // Hard delete

        console.log(`🗑️ Đã xóa thông báo ID: ${notificationId}`);
        res.json({ message: "Xóa thông báo thành công" });

    } catch (error) {
        console.error(`❌ Lỗi khi xóa thông báo ID ${notificationId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi xóa thông báo." });
    }
};