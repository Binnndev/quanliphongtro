module.exports = (sequelize, DataTypes) => {
    const PaymentDetail = sequelize.define(
        "PaymentDetail",
        {
            MaThanhToan: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            MaHoaDon: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            SoTien: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            NgayThanhToan: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            MaPTTT: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            MaGiaoDich: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            GhiChu: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: "ChiTietThanhToan",
            timestamps: false,
            indexes: [
                {
                    unique: false,
                    fields: ['MaHoaDon', 'NgayThanhToan'],
                },
            ],
        }
    );

    PaymentDetail.associate = (models) => {
        PaymentDetail.belongsTo(models.Invoice, { foreignKey: "MaHoaDon" });
        PaymentDetail.belongsTo(models.PaymentMethod, { foreignKey: "MaPTTT" });
    };
    return PaymentDetail;
};