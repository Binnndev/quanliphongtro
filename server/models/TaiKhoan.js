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
        // Nếu muốn bắt buộc người dùng chọn 1 loại, thì allowNull: false
        type: DataTypes.ENUM("Chủ Trọ", "Khách Thuê"),
        allowNull: true,
        //defaultValue: "Khách Thuê" (nếu cần mặc định)
      },
      TrangThai: {
        type: DataTypes.ENUM("Kích hoạt", "Vô hiệu hóa"),
        allowNull: false,
        defaultValue: "Kích hoạt",
      },
      NgayTao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        //auto set ngày hiện tại khi tạo
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "TaiKhoan",
      timestamps: false,
      hooks: {
        // mã hoá mật khẩu trước khi lưu
        beforeCreate: async (taiKhoan) => {
          const bcrypt = require("bcryptjs");
          taiKhoan.MatKhau = await bcrypt.hash(taiKhoan.MatKhau, 10);
        },
      },
    }
  );

  TaiKhoan.associate = function (models) {};

  return TaiKhoan;
};
