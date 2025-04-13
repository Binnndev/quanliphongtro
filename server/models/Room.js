module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define("Room", {
      MaPhong: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TenPhong: DataTypes.STRING,
      MaNhaTro: DataTypes.INTEGER,
      MaLoaiPhong: DataTypes.INTEGER,
      TrangThai: DataTypes.ENUM("Còn phòng", "Hết phòng", "Đang bảo trì"),
      GhiChu: DataTypes.TEXT,
    }, {
      tableName: "Phong",
      timestamps: false,
    });

  // Nếu cần định nghĩa quan hệ (associate) với các model khác, bạn có thể thêm vào đây
  Room.associate = function (models) {
    Room.belongsTo(models.RentalHouse, { foreignKey: "MaNhaTro" });
    Room.hasMany(models.Tenant, { foreignKey: "MaPhong" });
    Room.hasMany(models.Invoice, { foreignKey: "MaPhong" });
  };

  return Room;
};
