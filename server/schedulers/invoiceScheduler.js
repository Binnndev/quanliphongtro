const cron = require('node-cron');
const moment = require('moment');
const { Op, fn, col } = require('sequelize');
const {
  sequelize,
  Invoice,
  InvoiceDetail,
  RoomService,
  Service,
  Tenant,
  Room
} = require('../models');

cron.schedule('0 0 1 * *', async () => {
    console.log(`=== Bắt đầu lập hóa đơn định kỳ: ${new Date()} ===`);
  
    const previousMonth = moment().subtract(1, 'months').format('YYYY-MM');
    const firstDay = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
    const lastDay = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
  
    const transaction = await sequelize.transaction();
  
    try {
      // Lấy danh sách mã phòng có người đang thuê
      const rooms = await Room.findAll({ transaction });
  
      for (const room of rooms) {
        const MaPhong = room.MaPhong;
  
        // Tìm người đại diện của phòng
        const leader = await Tenant.findOne({
          where: {
            MaPhong,
            TrangThai: 'Đang thuê',
            LaNguoiDaiDien: true
          },
          transaction
        });
  
        if (!leader) continue; // Không có người đại diện → bỏ qua
  
        const MaKhachThue = leader.MaKhachThue;
  
        // Tổng hợp dịch vụ sử dụng trong tháng trước
        const servicesUsed = await RoomService.findAll({
          where: {
            MaPhong,
            NgaySuDung: { [Op.between]: [firstDay, lastDay] }
          },
          attributes: ['MaDV', [fn('SUM', col('SoLuong')), 'TongSoLuong']],
          group: ['MaDV'],
          transaction
        });
  
        if (servicesUsed.length === 0) continue;
  
        let TienDichVu = 0;
  
        for (const item of servicesUsed) {
          const MaDV = item.MaDV;
          const TongSoLuong = item.dataValues.TongSoLuong;
          const service = await Service.findByPk(MaDV, { transaction });
  
          const DonGia = parseFloat(service.Gia);
          const ThanhTien = DonGia * TongSoLuong;
          TienDichVu += ThanhTien;
        }
  
        // Giả lập các khoản khác (có thể tính theo chỉ số điện nước nếu cần)
        const TienPhong = 0;
        const TienDien = 0;
        const TienNuoc = 0;
        const TongTien = TienPhong + TienDien + TienNuoc + TienDichVu;
  
        await Invoice.create({
          MaKhachThue,
          MaPhong,
          NgayLap: moment().format('YYYY-MM-DD'),
          TienPhong,
          TienDien,
          TienNuoc,
          TienDichVu,
          TongTien,
          TrangThaiThanhToan: 'Chưa thanh toán',
          GhiChu: `Hóa đơn tháng ${previousMonth}`
        }, { transaction });
      }
  
      await transaction.commit();
      console.log('✅ Lập hóa đơn thành công theo phòng');
  
    } catch (err) {
      await transaction.rollback();
      console.error('❌ Lỗi khi lập hóa đơn:', err);
    }
  });