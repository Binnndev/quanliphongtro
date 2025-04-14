module.exports = (sequelize, DataTypes) => {
    const RoomService = sequelize.define(
        "RoomService",
        {
            MaPhong: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            MaDV: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            NgaySuDung: {
                type: DataTypes.DATEONLY,
                primaryKey: true,
                allowNull: false,
            },
            SoLuong: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "DichVuPhong",
            timestamps: false,
        }
        
    );

    RoomService.associate = (models) => {
        RoomService.belongsTo(models.Room, { foreignKey: 'MaPhong' });
        RoomService.belongsTo(models.Service, { foreignKey: 'MaDV' });
    }
    return RoomService;
};