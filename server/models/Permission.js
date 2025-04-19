module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define(
        "Permission",
        {
            MaQuyen: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            TenQuyen: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            MoTa: {
                type: DataTypes.STRING(255),
                allowNull: true,
            }
        },
        {
            tableName: "Quyen",
            timestamps: false,
        }
    );
    
    Permission.associate = function (models) {
        Permission.belongsToMany(models.Role, {
            through: "RolePermission",
            foreignKey: "MaQuyen",
            otherKey: "MaVaiTro",
        });
    };
    
    return Permission;
};