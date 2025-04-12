// models/ElectricWater.js
module.exports = (sequelize, DataTypes) => {
    const ElectricWater = sequelize.define("ElectricWater", {
      MaDienNuoc: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      MaPhong: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Loai: {
        type: DataTypes.ENUM("Điện", "Nước"),
        allowNull: false,
      },
      ChiSoDau: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ChiSoCuoi: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      NgayGhi: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      TrangThai: {
        type: DataTypes.ENUM("Chưa tính tiền", "Đã tính tiền"),
        allowNull: false,
        defaultValue: "Chưa tính tiền",
      },
    }, {
      tableName: "DienNuoc",
      timestamps: false,
    });
  
    ElectricWater.associate = (models) => {
      ElectricWater.belongsTo(models.Room, {
        foreignKey: "MaPhong",
        as: "Phong",
      });
    };
  
    return ElectricWater;
  };
  