module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      MaPhong: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Nếu bạn muốn tự động tăng
      },

      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rented: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amenities: {
        type: DataTypes.STRING, // Nếu cần lưu kiểu mảng có thể dùng JSON hoặc DataTypes.ARRAY(DataTypes.STRING)
        allowNull: true,
      },
      MaChuTro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Phong", // Bảng trong CSDL vẫn có tên "Phong"
      timestamps: false,
    }
  );

  // Nếu cần định nghĩa quan hệ (associate) với các model khác, bạn có thể thêm vào đây
  Room.associate = function (models) {
    Room.belongsTo(models.RentalHouse, { foreignKey: "MaNhaTro" });
    Room.hasMany(models.Tenant, { foreignKey: "MaPhong" });
    Room.hasMany(models.Invoice, { foreignKey: "MaPhong" });
  };

  return Room;
};
