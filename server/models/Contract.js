module.exports = (sequelize, DataTypes) => {
    const Contract = sequelize.define(
        "Contract",
        {
            MaHopDong: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            NgayBatDau: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            NgayKetThuc: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            MaKH: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            MaPhong: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        
        },
        {
            sequelize,
            tableName: "HopDong",
            timestamps: false,
        });
    return Contract;
};