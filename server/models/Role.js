module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define(
        "Role",
        {
            MaVaiTro: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TenVaiTro: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
        },
        {
            tableName: "VaiTro",
            timestamps: false,
        }
    );

    Role.associate = function (models) {
        Role.hasMany(models.TaiKhoan, { foreignKey: "MaVaiTro" });
        Role.belongsToMany(models.Permission, {
            through: "RolePermission",
            foreignKey: "MaVaiTro",
            otherKey: "MaQuyen",
        });
    }

    return Role;
};