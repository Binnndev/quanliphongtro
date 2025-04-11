const express = require("express");
const notificationController = require("../controllers/notificationController");
// Có thể thêm middleware xác thực người dùng ở đây nếu cần
// const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Định nghĩa Routes cho Notification ---

// GET: Lấy tất cả thông báo cho một người nhận cụ thể (ví dụ: người dùng đang đăng nhập)
// Thường sẽ lấy userId từ token (req.user.id) hoặc từ params nếu admin xem của người khác
// Ví dụ dùng params:
router.get(
    "/user/:userId",
    // authenticateToken, // Bảo vệ route nếu cần
    notificationController.getNotificationsForUser
);

// GET: Lấy một thông báo cụ thể bằng ID của nó
router.get(
    "/:id",
    // authenticateToken, // Bảo vệ route nếu cần
    notificationController.getNotificationById
);

// POST: Tạo một thông báo mới
router.post(
    "/",
    // authenticateToken, // Ai được phép gửi thông báo?
    notificationController.createNotification
);

// PATCH: Đánh dấu một thông báo cụ thể là đã đọc
router.patch(
    "/:id/read",
    // authenticateToken, // Người nhận mới được đánh dấu đã đọc
    notificationController.markAsRead
);

// PATCH: Đánh dấu tất cả thông báo chưa đọc của người dùng là đã đọc
router.patch(
    "/user/:userId/read-all",
    // authenticateToken, // Người nhận mới được đánh dấu đã đọc
    notificationController.markAllAsRead
);

// DELETE: Xóa một thông báo (thường là cho người nhận)
router.delete(
    "/:id",
    // authenticateToken, // Người nhận hoặc admin mới được xóa
    notificationController.deleteNotification
);


// --- (Tùy chọn) Route lấy các thông báo đã gửi ---
// router.get(
//     "/sent/:userId",
//     // authenticateToken,
//     notificationController.getSentNotificationsByUser
// );

// --- (Tùy chọn) Route lấy tất cả thông báo (cho admin) ---
// router.get(
//     "/",
//     // authenticateToken, // Thêm middleware kiểm tra quyền admin
//     notificationController.getAllNotifications
// );


module.exports = router;