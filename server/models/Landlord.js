module.exports = (sequelize, DataTypes) => {
  const Landlord = sequelize.define(
    "Landlord",
    {
      MaChuTro: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      HoTen: DataTypes.STRING,
      Email: { type: DataTypes.STRING, validate: { isEmail: true } },
      SoDienThoai: DataTypes.STRING,
      MaTK: DataTypes.INTEGER,
    },
    {
      tableName: "ChuTro",
      timestamps: false,
    }
  );

  Landlord.associate = (models) => {
    Landlord.belongsTo(models.TaiKhoan, { foreignKey: "MaTK", as: "Account" }); // 1‑1
    Landlord.hasMany(models.RentalHouse, {
      foreignKey: "MaChuTro",
      as: "Houses",
    });
  };

  return Landlord;
};
