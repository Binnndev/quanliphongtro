const { Invoice, InvoiceDetail, Service, Room, RentalHouse, Landlord, Tenant, ElectricWater, PaymentDetail  } = require("../models");
const { Op } = require("sequelize");

exports.getAll = async (req, res) => {
  try {
    console.log({
      TenantModel: typeof Tenant,
      RoomModel: typeof Room,
      RentalHouseModel: typeof RentalHouse,
      LandlordModel: typeof Landlord,
      PaymentDetailModel: typeof PaymentDetail,
    });
    const invoices = await Invoice.findAll({
      include: [
        {
          model: Tenant,
          attributes: ["HoTen", "Email", "SoDienThoai"],
        },
        {
          model: Room,
          attributes: ["TenPhong", "MaNhaTro"],
          include: {
            model: RentalHouse,
            attributes: ["TenNhaTro", "DiaChi", "MaChuTro"],
            include: {
              model: Landlord,
              attributes: ["HoTen", "SoDienThoai", "Email"],
            },
          },
        },
        {
          model: PaymentDetail,
          attributes: ["SoTien"],
        },
      ],
      order: [["NgayLap", "DESC"]],
    });

    const formatted = invoices.map((invoice) => {
      const totalPaid = invoice.PaymentDetails.reduce(
        (sum, p) => sum + parseFloat(p.SoTien),
        0
      );
      const conLai = parseFloat(invoice.TongTien) - totalPaid;
      const room = invoice.Room || {};
      const house = room.RentalHouse || {};
      const landlord = house.Landlord || {};

      return {
        ...invoice.toJSON(),
        TenPhong: room.TenPhong,
        TenNhaTro: house.TenNhaTro,
        DiaChiNha: house.DiaChi,
        TenChuTro: landlord.HoTen,
        SdtChuTro: landlord.SoDienThoai,
        EmailChuTro: landlord.Email,
        TenKhachThue: invoice.Tenant?.HoTen,
        SdtKhach: invoice.Tenant?.SoDienThoai,
        EmailKhach: invoice.Tenant?.Email,
        DaTra: totalPaid,
        ConLai: conLai,
        TrangThaiThanhToan:
          totalPaid >= invoice.TongTien ? "Đã thanh toán" : "Chưa thanh toán",
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Lỗi lấy danh sách hóa đơn:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.getById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Tenant,
          attributes: ["HoTen", "Email", "SoDienThoai", "MaTK"],
        },
        {
          model: Room,
          attributes: ["TenPhong", "MaNhaTro"],
          include: {
            model: RentalHouse,
            attributes: ["TenNhaTro", "DiaChi", "MaChuTro"],
            include: {
              model: Landlord,
              attributes: ["HoTen", "SoDienThoai", "Email"],
            },
          },
        },
        {
          model: PaymentDetail,
          attributes: ["SoTien"],
        },
        {
          model: InvoiceDetail,
          attributes: ["SoLuong", "ThanhTien", "DonGia", "MaDV"],
          include: [
            {
              model: Service,
              as: "Service",
              attributes: ["TenDV"],
              required: false, // Để tránh lỗi nếu không có Service tương ứng
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ error: "Không tìm thấy hóa đơn" });
    }

    const dienNuocList = await ElectricWater.findAll({
      where: {
        MaPhong: invoice.MaPhong,
        NgayGhi: {
          [Op.lte]: invoice.NgayLap,
        },
      },
    });
    const danhSachChiTiet = invoice.InvoiceDetails.map((item) => {
      const tenDV = item.Service?.TenDV?.toLowerCase();
      const dienNuoc = dienNuocList.find((dn) =>
        (tenDV.includes("điện") && dn.Loai === "Điện") ||
        (tenDV.includes("nước") && dn.Loai === "Nước")
      );

      return {
        moTa: item.Service?.TenDV || `Dịch vụ #${item.MaDV}`,
        chiSoDau: dienNuoc?.ChiSoDau || "",
        chiSoCuoi: dienNuoc?.ChiSoCuoi || "",
        soLuong: item.SoLuong,
        donGia: item.DonGia?.toLocaleString("vi-VN") + " đ",
        gia: item.ThanhTien?.toLocaleString("vi-VN") + " đ",
      };
    });

    const totalPaid = invoice.PaymentDetails.reduce(
      (sum, p) => sum + parseFloat(p.SoTien),
      0
    );
    const conLai = parseFloat(invoice.TongTien) - totalPaid;
    const room = invoice.Room || {};
    const house = room.RentalHouse || {};
    const landlord = house.Landlord || {};

    const result = {
      ...invoice.toJSON(),
      TenPhong: room.TenPhong,
      TenNhaTro: house.TenNhaTro,
      DiaChiNha: house.DiaChi,
      TenChuTro: landlord.HoTen,
      SdtChuTro: landlord.SoDienThoai,
      EmailChuTro: landlord.Email,
      TenKhachThue: invoice.Tenant?.HoTen,
      SdtKhach: invoice.Tenant?.SoDienThoai,
      EmailKhach: invoice.Tenant?.Email,
      DaTra: totalPaid,
      ConLai: conLai,
      TrangThaiThanhToan:
        totalPaid >= invoice.TongTien ? "Đã thanh toán" : "Chưa thanh toán",
        danhSachChiTiet,
    };
    console.log("🎯 Kiểm tra JOIN:");
    invoice.InvoiceDetails.forEach((item, i) => {
      console.log(`[#${i + 1}] MaDV = ${item.MaDV}, Service:`, item.Service);
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi lấy hóa đơn:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};


// Dummy để không lỗi khi gọi POST/PUT/DELETE
exports.create = async (req, res) => {
  try {
    const newInvoice = await Invoice.create(req.body);
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Lỗi tạo hóa đơn:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.update = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Không tìm thấy" });

    await invoice.update(req.body);
    res.status(200).json(invoice);
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

exports.delete = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Không tìm thấy" });

    await invoice.destroy();
    res.status(200).json({ message: "Đã xoá thành công" });
  } catch (error) {
    console.error("Lỗi xoá:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};
