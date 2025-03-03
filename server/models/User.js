const { Model, DataTypes } = require("sequelize");
const sequelize = require("./index").sequelize;
const bcrypt = require("bcryptjs");

class User extends Model {}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetToken: { type: DataTypes.STRING },
    resetTokenExpiry: { type: DataTypes.DATE },
  },
  {
    sequelize,
    modelName: "User",
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

module.exports = (sequelize, DataTypes) => {
  const NguoiDung = sequelize.define("NguoiDung", {
    tenNguoiDung: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    matKhau: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vaiTro: {
      type: DataTypes.ENUM("admin", "chuTro", "khachThue"),
      defaultValue: "khachThue",
    },
    tokenDatLaiMatKhau: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hanTokenDatLai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
  return NguoiDung;
};
