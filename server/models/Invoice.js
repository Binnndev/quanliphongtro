module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define(
      "Invoice",
      {
        MaHoaDon: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        MaKhachThue: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        MaPhong: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        NgayLap: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        TienPhong: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        TienDien: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        TienNuoc: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        TienDichVu: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        TongTien: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        TrangThaiThanhToan: {
          type: DataTypes.ENUM("Chưa thanh toán", "Đã thanh toán"),
          defaultValue: "Chưa thanh toán",
        },
        GhiChu: {
          type: DataTypes.STRING(255),
        },
      },
      {
        sequelize,
        tableName: "HoaDon",
        timestamps: false,
      }
    );
  
    Invoice.associate = (models) => {
      if (models.Tenant) {
        Invoice.belongsTo(models.Tenant, {
          foreignKey: "MaKhachThue",
          targetKey: "MaKhachThue",
        });
      }
  
      if (models.Room) {
        Invoice.belongsTo(models.Room, {
          foreignKey: "MaPhong",
          targetKey: "MaPhong",
        });
      }
  
      if (models.PaymentDetail) {
        Invoice.hasMany(models.PaymentDetail, {
          foreignKey: "MaHoaDon",
        });
      }
  
      if (models.InvoiceDetail) {
        Invoice.hasMany(models.InvoiceDetail, {
          foreignKey: "MaHoaDon",
        });
      }
    };
  
    return Invoice;
  };
  