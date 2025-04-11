module.exports = (sequelize, DataTypes) => {
    const ElectricWater = sequelize.define(
        "ElectricWater",
        {
            MaDienNuoc: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            MaPhong: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Loai: {
                type: DataTypes.ENUM("Điện", "Nước"),
                allowNull: false,
            },
            ChiSoDau: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ChiSoCuoi: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            NgayGhi: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            TrangThai: {
                type: DataTypes.ENUM("Chưa tính tiền", "Đã tính tiền"),
                defaultValue: "Chưa tính tiền",
            },
        },
        {
            sequelize,
            tableName: "DienNuoc",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["MaPhong", "Loai", "NgayGhi"],
                },
            ],
        }
    );

    ElectricWater.associate = (models) => {
        ElectricWater.belongsTo(models.Room, { foreignKey: 'MaPhong' });
    }
    return ElectricWater;
};
