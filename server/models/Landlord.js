module.exports = (sequelize, DataTypes) => {
    const Landlord = sequelize.define("Landlord", {
      MaChuTro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      HoTen: DataTypes.STRING,
      Email: DataTypes.STRING,
        SoDienThoai: DataTypes.STRING,
      MaTK: DataTypes.INTEGER,
    }, {
      tableName: "ChuTro",
      timestamps: false,
    });
  
    Landlord.associate = (models) => {
        Landlord.hasOne(models.User, { foreignKey: "MaTK" });
        Landlord.hasMany(models.RentalHouse, { foreignKey: "MaChuTro" });
    };
  
    return Landlord;
  };