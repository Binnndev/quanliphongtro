module.exports = (sequelize, DataTypes) => {
    const House = sequelize.define(
        "House",
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

    House.associate = (models) => {
        House.belongsTo(models.Landlord, {
            foreignKey: "MaChuTro",
            as: "Landlord",
        });
        House.hasMany(models.Room, {
            foreignKey: "MaNhaTro",
            as: "Rooms",
        });
    };
    return House;
};

