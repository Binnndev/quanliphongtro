// controllers/notificationController.js

// --- Imports ---
// Import User model instead of Tenant for associations
const { Notification, User, Sequelize } = require("../models");
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
        const senderExists = await User.findByPk(MaNguoiGui);
        const receiverExists = await User.findByPk(MaNguoiNhan);
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
                model: User,
                as: 'SenderAccount', // Use the correct alias
                attributes: ['MaTK', 'HoTen', 'Avatar'] // Include desired User attributes (adjust as needed)
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

// 🟢 Lấy danh sách thông báo cho người nhận (User ID = MaTK)
exports.getNotificationsForUser = async (req, res) => {
    const userId = req.params.userId; // This should be the MaTK of the logged-in user
    const limit = parseInt(req.query.limit) || 15; // Default limit
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const readStatus = req.query.read; // 'true', 'false', or undefined

    try {
        const whereCondition = { MaNguoiNhan: userId }; // Filter by Receiver's MaTK
        if (readStatus === 'true') {
            whereCondition.DaDoc = true;
        } else if (readStatus === 'false') {
            whereCondition.DaDoc = false;
        }

        const { count, rows } = await Notification.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['ThoiGian', 'DESC']],
            include: [{
                model: User,
                as: 'SenderAccount', // Correct alias
                attributes: ['MaTK'] // Attributes from User model - ADJUST IF NEEDED
                // If name is in Tenant/Landlord profile, use nested include:
                // include: [{
                //     model: User, as: 'SenderAccount', attributes: ['MaTK'],
                //     include: [
                //         { model: Tenant, attributes: ['HoTen'], required: false }, // Assuming Tenant model exists and is linked to User
                //         { model: Landlord, attributes: ['HoTen'], required: false } // Assuming Landlord model exists and is linked
                //     ]
                // }]
            }]
        });

        const totalPages = Math.ceil(count / limit);

        console.log(`✅ Lấy ${rows.length}/${count} thông báo cho User (MaTK): ${userId}`);
        res.json({
            message: "Lấy danh sách thông báo thành công",
            data: rows,
            pagination: { totalItems: count, totalPages, currentPage: page, limit }
        });

    } catch (error) {
        console.error(`❌ Lỗi khi lấy thông báo cho User (MaTK) ${userId}:`, error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách thông báo." });
    }
};

// 🟢 Lấy thông báo theo ID của nó
exports.getNotificationById = async (req, res) => {
    const notificationId = req.params.id;
    try {
        const notification = await Notification.findByPk(notificationId, {
             include: [
                 { model: User, as: 'SenderAccount', attributes: ['MaTK', 'HoTen', 'Avatar'] }, // Use User model and correct alias
                 { model: User, as: 'ReceiverAccount', attributes: ['MaTK', 'HoTen', 'Avatar'] } // Use User model and correct alias
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
             include: [{ model: User, as: 'SenderAccount', attributes: ['MaTK'] }] // Include sender info in response
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