module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      MaTK: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        TenDangNhap: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        MatKhau: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        LoaiTaiKhoan: {
            type: DataTypes.ENUM("Chủ trọ", "Khách thuê"),
            allowNull: false,
        },
        TrangThai: {
            type: DataTypes.ENUM("Kích hoạt", "Vô hiệu hóa", "Chờ duyệt", "Tạm khóa"),
            allowNull: false,
        },
        NgayTao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
      tableName: "TaiKhoan",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          const bcrypt = require("bcryptjs");
          user.password = await bcrypt.hash(user.password, 10);
        },
      },
    }
  );

  // Định nghĩa các associations nếu cần
  User.associate = function (models) {
    User.hasMany(models.Notification, { foreignKey: 'MaNguoiGui', as: 'SentNotifications' });
     User.hasMany(models.Notification, { foreignKey: 'MaNguoiNhan', as: 'ReceivedNotifications' });
  };

  return User;
};
