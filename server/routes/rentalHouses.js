const express = require('express');
const router = express.Router();
const rentalHouseManager = require('../controllers/rentalHouseController'); // Import your controller
const { getUserRole } = require('../middlewares/authMiddleware');


// Define routes
router.get('/', rentalHouseManager.getAllHouses);
router.get('/:id', rentalHouseManager.getHouseById);
router.get('/:name', rentalHouseManager.getHouseByName);
router.get('/landlord/:landlordId', rentalHouseManager.getHouseByLandlord);
router.get(
    '/:nhaTroId/rooms', // Hoặc '/rooms/house/:nhaTroId' tùy bạn chọn // <<< Middleware xác thực
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ")
          return res.status(403).json({ error: "Không có quyền" });
        next();
    },
    rentalHouseManager.getRoomsByHouse // <<< Gọi hàm controller mới
);
router.post('/',
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ")
          return res.status(403).json({ error: "Không có quyền" });
        next();
    },
    rentalHouseManager.createHouse);

router.put('/:id',
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ")
          return res.status(403).json({ error: "Không có quyền" });
        next();
    },
    rentalHouseManager.updateHouse);

router.delete('/:id',
    getUserRole,
    (req, res, next) => {
        if (req.role !== "Chủ trọ")
          return res.status(403).json({ error: "Không có quyền" });
        next();
    },
    rentalHouseManager.deleteHouse);

module.exports = router;