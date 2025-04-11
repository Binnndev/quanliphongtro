const express = require("express");
const multer = require('multer'); // 1. Import multer
const path = require('path'); // Để xử lý đường dẫn file
const tenantController = require("../controllers/tenantController");
const router = express.Router();

// --- Cấu hình Multer ---
// Nơi lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu file (đảm bảo thư mục này tồn tại)
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất: fieldname-<timestamp>.<extension>
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Bộ lọc file (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); // Chấp nhận file
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG!'), false); // Từ chối file
    }
};

// Khởi tạo middleware upload của multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Giới hạn 5MB
    },
    fileFilter: fileFilter
});
// ------------------------

router.get("/", tenantController.getAllTenants);
router.get("/id/:id", tenantController.getTenantById);
router.get("/gender/:sex", tenantController.getTenantByGender);
router.get("/room/:roomId", tenantController.getTenantByRoom);
router.get("/room/:roomId/representative", tenantController.getRepresentativeByRoom);
router.get("/room/:roomId/members", tenantController.getMembersByRoom);

// 2. Áp dụng middleware upload.single('documentPhoto') cho route update
// 'documentPhoto' là tên field trong FormData gửi từ frontend
router.patch(
    "/update/:id",
    upload.single('documentPhoto'), // Xử lý upload file trước khi vào controller
    tenantController.updateTenant
);

router.post("/add", upload.single('documentPhoto'), tenantController.addTenant); // Cũng nên áp dụng cho add nếu cần upload ảnh khi thêm mới
router.delete("/delete/:id", tenantController.deleteTenant);

// ⭐⭐⭐ ROUTE MỚI: Đổi người đại diện ⭐⭐⭐
router.patch(
    "/change-representative", // Không cần ID trong URL, dùng body
    tenantController.changeRoomRepresentative
);

// Route tìm kiếm (nếu có)
router.get("/search", tenantController.searchTenantByName); // Giả sử có controller này

module.exports = router;