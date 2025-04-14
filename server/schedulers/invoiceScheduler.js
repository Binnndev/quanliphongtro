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
    // Lấy danh sách các khách thuê đang thuê phòng
    const activeTenants = await Tenant.findAll({
      where: { TrangThai: 'Đang thuê' },
      include: [{ model: Room, as: 'Room' }],
      transaction
    });

    for (const tenant of activeTenants) {
      const MaPhong = tenant.MaPhong;
      const MaKhachThue = tenant.MaKhachThue;

      // Tổng hợp dịch vụ của phòng trong tháng trước
      const servicesUsed = await RoomService.findAll({
        where: {
          MaPhong,
          NgaySuDung: { [Op.between]: [firstDay, lastDay] }
        },
        attributes: [
          'MaDV',
          [fn('SUM', col('SoLuong')), 'TongSoLuong']
        ],
        group: ['MaDV'],
        transaction
      });

      if (servicesUsed.length === 0) continue; // Không dùng dịch vụ => bỏ qua

      let TienDichVu = 0;
      const invoiceDetails = [];

      for (const serviceItem of servicesUsed) {
        const MaDV = serviceItem.MaDV;
        const TongSoLuong = serviceItem.dataValues.TongSoLuong;

        const service = await Service.findOne({ where: { MaDV }, transaction });
        const DonGia = parseFloat(service.Gia);
        const ThanhTien = DonGia * TongSoLuong;

        TienDichVu += ThanhTien;

        invoiceDetails.push({
          MaDV,
          SoLuong: TongSoLuong,
          DonGia,
          ThanhTien
        });
      }

      // Các khoản phí khác (ví dụ, tiền phòng, điện, nước) bạn có thể bổ sung sau
      const TienPhong = 0;
      const TienDien = 0;
      const TienNuoc = 0;
      const TongTien = TienPhong + TienDien + TienNuoc + TienDichVu;

      // Tạo hóa đơn
      const newInvoice = await Invoice.create({
        MaKhachThue,
        MaPhong,
        NgayLap: moment().format('YYYY-MM-DD'),
        TienPhong,
        TienDien,
        TienNuoc,
        TienDichVu,
        TongTien,
        TrangThaiThanhToan: 'Chưa thanh toán',
        GhiChu: `Hóa đơn dịch vụ tháng ${previousMonth}`
      }, { transaction });

      // Tạo chi tiết hóa đơn
      await InvoiceDetail.bulkCreate(invoiceDetails.map(d => ({
        MaHoaDon: newInvoice.MaHoaDon,
        MaDV: d.MaDV,
        SoLuong: d.SoLuong,
        DonGia: d.DonGia,
        ThanhTien: d.ThanhTien
      })), { transaction });
    }

    await transaction.commit();
    console.log('✅ Lập hóa đơn thành công cho toàn bộ khách thuê');

  } catch (err) {
    await transaction.rollback();
    console.error('❌ Lỗi khi lập hóa đơn:', err);
  }
});
