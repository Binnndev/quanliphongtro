module.exports = (sequelize, DataTypes) => {
    const InvoiceDetail = sequelize.define(
        "InvoiceDetail",
        {
            MaHoaDon: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            MaDV: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            SoLuong: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            DonGia: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            ThanhTien: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "ChiTietHoaDon",
            timestamps: false,
        }
    );

    InvoiceDetail.associate = (models) => {
        InvoiceDetail.belongsTo(models.Service, {
            foreignKey: "MaDV",
            as: "Service",
        });
        InvoiceDetail.belongsTo(models.Invoice, {
            foreignKey: "MaHoaDon",
        });
    };
    return InvoiceDetail;
};