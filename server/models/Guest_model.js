const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database.js");

module.exports = (sequelize, DataTypes) => {
    class Guest extends Model {}
  
    Guest.init(
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
        modelName: "Guest",
        tableName: "KhachHang", // Tên bảng trong database
        timestamps: false,
      }
    );
  
    return Guest;
  };
  
