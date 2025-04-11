const { Landlord, House, Room, Tenant, User, sequelize, Sequelize } = require('../models'); // Đường dẫn có thể khác tùy cấu trúc dự án của bạn
const { Op } = Sequelize; // Import Op nếu bạn dùng nó để query (như trong ví dụ getLandlordTenantsWithAccount)


exports.getLandlordHouses = async (req, res) => {
    const landlordUserId = req.params.landlordUserId; // Lấy MaTK của chủ trọ từ user đăng nhập hoặc param
    try {
        // Tìm MaChuTro tương ứng với MaTK
        const landlord = await Landlord.findOne({ where: { MaTK: landlordUserId } });
        if (!landlord) {
            return res.status(404).send({ message: 'Không tìm thấy thông tin chủ trọ.' });
        }

        const houses = await House.findAll({
            where: { MaChuTro: landlord.MaChuTro },
            include: [{ // Tùy chọn: Lấy luôn danh sách phòng thuộc nhà trọ
                model: Room,
                as: 'Rooms', // Sử dụng alias đã định nghĩa trong association
                attributes: ['MaPhong', 'TenPhong'] // Chỉ lấy các trường cần thiết
            }]
        });
        res.status(200).json(houses);
    } catch (error) {
        console.error("Error fetching landlord houses:", error);
        res.status(500).send({ message: 'Lỗi lấy danh sách nhà trọ.' });
    }
};

exports.getLandlordTenantsWithAccount = async (req, res) => {
    const landlordUserId = req.params.landlordUserId;
    try {
        const landlord = await Landlord.findOne({ where: { MaTK: landlordUserId } });
         if (!landlord) {
            return res.status(404).send({ message: 'Không tìm thấy thông tin chủ trọ.' });
        }

        const tenants = await Tenant.findAll({
            where: {
                MaTK: { [Op.ne]: null } // Chỉ lấy tenant có tài khoản liên kết
            },
            include: [
                {
                    model: Room,
                    as: 'Room',
                    required: true, // INNER JOIN để đảm bảo tenant phải thuộc 1 phòng
                    attributes: ['MaPhong', 'TenPhong', 'MaNhaTro'],
                    include: [{
                        model: House,
                        as: 'House', // Đảm bảo alias này đúng với association trong Room model
                        required: true, // INNER JOIN
                        attributes: ['MaNhaTro', 'TenNhaTro'],
                        where: { MaChuTro: landlord.MaChuTro } // Lọc theo nhà trọ của chủ trọ
                    }]
                },
                {
                    model: User, // Lấy thông tin User nếu cần
                    as: 'User',
                    attributes: ['MaTK', 'TenDangNhap']
                }
            ],
             attributes: ['MaKhachThue', 'HoTen', 'MaPhong', 'MaTK'] // Các trường cần thiết của Tenant
        });
        res.status(200).json(tenants);
    } catch (error) {
         console.error("Error fetching landlord tenants:", error);
        res.status(500).send({ message: 'Lỗi lấy danh sách khách thuê.' });
    }
};