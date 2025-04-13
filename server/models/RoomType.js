module.exports = (sequelize, DataTypes) => {
    const RoomType = sequelize.define('RoomType', {
        MaLoaiPhong: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        TenLoai: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Gia: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        DienTich: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        SoNguoiToiDa: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        MaChuTro: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'LoaiPhong',
        timestamps: false,
    });

    RoomType.associate = function (models) {
        RoomType.hasMany(models.Room, { foreignKey: 'MaLoaiPhong' });
        RoomType.belongsTo(models.Landlord, { foreignKey: 'MaChuTro' });
    }

    return RoomType;


}