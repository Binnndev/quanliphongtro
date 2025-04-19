module.exports = (sequelize, DataTypes) => {
  const TaiKhoan = sequelize.define(
    "TaiKhoan",
    {
      MaTK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TenDangNhap: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      MatKhau: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
        MaVaiTro: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
      TrangThai: {
        type: DataTypes.ENUM("Kích hoạt", "Vô hiệu hóa", "Tạm khóa"),
        allowNull: false,
        defaultValue: "Kích hoạt",
      },
      NgayTao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "TaiKhoan",
      timestamps: false,
      hooks: {
        beforeCreate: async (taiKhoan) => {
          const bcrypt = require("bcryptjs");
          taiKhoan.MatKhau = await bcrypt.hash(taiKhoan.MatKhau, 10);
        },
      },
    }
  );

    TaiKhoan.associate = function (models) {
        TaiKhoan.belongsTo(models.Role, { foreignKey: "MaVaiTro" });
        TaiKhoan.hasMany(models.Tenant, { foreignKey: "MaTK" });
        TaiKhoan.hasMany(models.Landlord, { foreignKey: "MaTK" });
  };

  return TaiKhoan;
};
