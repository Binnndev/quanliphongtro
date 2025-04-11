module.exports = (sequelize, DataTypes) => {
    const PaymentMethod = sequelize.define(
        "PaymentMethod",
        {
            MaPTTT: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TenPTTT: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            MoTa: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: "PhuongThucThanhToan",
            timestamps: false,
        }
    );

    return PaymentMethod;
};