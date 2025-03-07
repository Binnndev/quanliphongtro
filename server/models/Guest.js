const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Guest = sequelize.define(
        "Guest",
      {
        MaKH: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        TenKH: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        CMND: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        SoDienThoai: {
          type: DataTypes.STRING,
          unique: true,
        },
        DiaChi: {
          type: DataTypes.STRING,
        },
        Email: {
          type: DataTypes.STRING,
          unique: true,
          validate: { isEmail: true },
        },
        NgaySinh: {
          type: DataTypes.DATE,
        },
        GioiTinh: {
          type: DataTypes.STRING,
        },
        NgayDangKy: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.NOW,
        },
        TrangThaiTaiKhoan: {
          type: DataTypes.STRING,
          defaultValue: "Hoạt động",
        },
        GhiChu: {
          type: DataTypes.STRING,
        },
        AnhGiayTo: {
          type: DataTypes.STRING,
        },
      },
      {
        sequelize,
        tableName: "KhachHang", // Tên bảng trong database
        timestamps: false,
      }
    );
  
    return Guest;
  };
  
