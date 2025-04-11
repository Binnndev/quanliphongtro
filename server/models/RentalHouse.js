module.exports = (sequelize, DataTypes) => {
    const RentalHouse = sequelize.define(
        "RentalHouse",
        {
            MaNhaTro: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TenNhaTro: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            DiaChi: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            MaChuTro: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "NhaTro",
            timestamps: false,
        }
    )

    RentalHouse.associate = (models) => {
        RentalHouse.belongsTo(models.Landlord, {
            foreignKey: "MaChuTro",
            // as: "Landlord",
        });
        RentalHouse.hasMany(models.Room, {
            foreignKey: "MaNhaTro",
            // as: "Rooms",
        });
    };
    return RentalHouse;
};

