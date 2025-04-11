const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Tenant = sequelize.define(
        "Tenant",
        {
            MaKhachThue: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true,
            },
            MaPhong: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            HoTen: {
              type: DataTypes.STRING,
              allowNull: false,
            },
            MaTK: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            CCCD: {
              type: DataTypes.STRING,
              allowNull: false,
              unique: true,
            },
            SoDienThoai: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            Email: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                validate: { isEmail: true },
            },
            NgaySinh: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            GioiTinh: {
                type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
                allowNull: false,
            },
            GhiChu: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            AnhGiayTo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            TrangThai: {
                type: DataTypes.ENUM("Đang thuê", "Đã rời đi"),
                defaultValue: "Đang thuê",
            },
            LaNguoiDaiDien: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            NgayThue: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            NgayRoiDi: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: "KhachThue", // Tên bảng trong database
            timestamps: false,
        }
    );
  
    return Tenant;
  };
  
