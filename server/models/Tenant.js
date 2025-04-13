module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define(
    "Tenant",
    {
      MaKhachThue: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      MaPhong: DataTypes.INTEGER,
      HoTen: { type: DataTypes.STRING, allowNull: false },
      MaTK: DataTypes.INTEGER,
      CCCD: { type: DataTypes.STRING, allowNull: false, unique: true },
      SoDienThoai: { type: DataTypes.STRING, allowNull: false, unique: true },
      Email: {
        type: DataTypes.STRING,
        unique: true,
        validate: { isEmail: true },
      },
      NgaySinh: DataTypes.DATEONLY,
      GioiTinh: { type: DataTypes.ENUM("Nam", "Nữ", "Khác"), allowNull: false },
      GhiChu: DataTypes.STRING,
      AnhGiayTo: DataTypes.STRING,
      TrangThai: {
        type: DataTypes.ENUM("Đang thuê", "Đã rời đi"),
        defaultValue: "Đang thuê",
      },
      LaNguoiDaiDien: { type: DataTypes.BOOLEAN, defaultValue: false },
      NgayThue: DataTypes.DATEONLY,
      NgayRoiDi: DataTypes.DATEONLY,
    },
    {
      tableName: "KhachThue",
      timestamps: false,
    }
  );

  Tenant.associate = (models) => {
    Tenant.belongsTo(models.Room, { foreignKey: "MaPhong", as: "Room" });
    Tenant.belongsTo(models.TaiKhoan, { foreignKey: "MaTK", as: "User" });
    Tenant.hasMany(models.Invoice, {
      foreignKey: "MaKhachThue",
      as: "Invoices",
    });
  };

  return Tenant;
};
