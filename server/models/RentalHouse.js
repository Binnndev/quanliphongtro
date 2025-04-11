module.exports = (sequelize, DataTypes) => {
    const RentalHouse = sequelize.define("RentalHouse", {
      MaNhaTro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      TenNhaTro: DataTypes.STRING,
      DiaChi: DataTypes.STRING,
      MaChuTro: DataTypes.INTEGER,
    }, {
      tableName: "NhaTro",
      timestamps: false,
    });
  
    RentalHouse.associate = (models) => {
      RentalHouse.belongsTo(models.Landlord, { foreignKey: "MaChuTro" });
      RentalHouse.hasMany(models.Room, { foreignKey: "MaNhaTro" });
    };
  
    return RentalHouse;
  };