module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define(
        "Service",
        {
            MaDV: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TenDV: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            LoaiDichVu: {
                type: DataTypes.ENUM("Cố định", "Theo số lượng"),
            },
            DonViTinh: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            Gia: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            MaChuTro: {
                type: DataTypes.INTEGER,
                allowNull: false,
              },    
        },
        {
            sequelize,
            tableName: "DichVu",
            timestamps: false,
        }
    );

    Service.associate = (models) => {
        Service.belongsTo(models.Landlord, {
            foreignKey: "MaChuTro",
            // as: "ChuTro"
          });
        Service.hasMany(models.InvoiceDetail, { foreignKey: "MaDV" });
    };
    return Service;
};