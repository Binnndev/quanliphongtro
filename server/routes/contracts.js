const express = require("express");
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const contractController = require("../controllers/contractController");
const router = express.Router();

// --- Cấu hình Multer cho file hợp đồng ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/contracts/'); // Thư mục lưu file hợp đồng
    },
    filename: function (req, file, cb) {
        // Đảm bảo tên file không trùng lặp và giữ phần extension
        cb(null, 'contract-' + Date.now() + path.extname(file.originalname));
    }
});

// Bộ lọc file (chấp nhận các định dạng phổ biến)
const fileFilter = (req, file, cb) => {
     // Có thể mở rộng danh sách chấp nhận
    const allowedTypes = /pdf|doc|docx|jpeg|png|jpg/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận: PDF, DOC, DOCX, JPG, PNG, JPEG'), false);
};

// Middleware upload của multer (có thể tùy chỉnh giới hạn kích thước)
const uploadContract = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // Giới hạn 10MB
    fileFilter: fileFilter
});
// ------------------------------------


// === Định nghĩa Routes ===

// GET
router.get("/room/:roomId", contractController.getContractByRoom); // Lấy HĐ mới nhất/hiệu lực của phòng
router.get("/:id", contractController.getContractById); // Lấy HĐ theo ID của nó
router.get("/", contractController.getAllContracts); // Lấy tất cả HĐ (có thể thêm filter)

// POST (Thêm mới - cần xử lý file)
// 'contractFile' phải khớp với key FormData gửi từ frontend
router.post(
    "/add",
    uploadContract.single('contractFile'), // Middleware multer xử lý file trước
    contractController.createContract
);

// PATCH (Cập nhật - cần xử lý file)
// 'contractFile' phải khớp với key FormData gửi từ frontend
router.patch(
    "/update/:id",
    uploadContract.single('contractFile'), // Middleware multer xử lý file trước
    contractController.updateContract
);

// PATCH (Hủy hợp đồng - chỉ cập nhật trạng thái)
router.patch(
    "/terminate/:id",
    contractController.terminateContract
);

// GET (Tải file)
router.get(
    "/download/:id",
    contractController.downloadContractFile
);


// --- Bỏ các route không dùng nữa ---
// router.delete("/delete/:id", ...);
// router.patch("/renew/:id", ...);
// router.patch("/end/:id", ...);

module.exports = router;