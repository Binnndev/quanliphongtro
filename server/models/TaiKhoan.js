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
      LoaiTaiKhoan: {
        type: DataTypes.ENUM("Chủ Trọ", "Khách Thuê"),
        allowNull: true,
      },
      TrangThai: {
        type: DataTypes.ENUM("Kích hoạt", "Vô hiệu hóa"),
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
    // Các quan hệ nếu có
  };

  return TaiKhoan;
};
