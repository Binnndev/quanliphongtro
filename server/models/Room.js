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

  Room.associate = (models) => {
    Room.belongsTo(models.House, { foreignKey: "MaNhaTro" });
    Room.hasMany(models.Tenant, { foreignKey: "MaPhong" });
    Room.hasMany(models.Invoice, { foreignKey: "MaPhong" });
  };
  
  return Room;
};
