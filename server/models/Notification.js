module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
        "Notification",
        {
            MaThongBao: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            MaNguoiGui: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "TaiKhoan",
                    key: "MaTK",
                },
            },
            MaNguoiNhan: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "TaiKhoan",
                    key: "MaTK",
                },
            },
            TieuDe: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            NoiDung: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            ThoiGian: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            DaDoc: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            tableName: "ThongBao",
            timestamps: false,
        });
                
        Notification.associate = function(models) {
            Notification.belongsTo(models.User, { foreignKey: 'MaNguoiGui', as: 'SenderAccount' });
            Notification.belongsTo(models.User, { foreignKey: 'MaNguoiNhan', as: 'ReceiverAccount' });
        }
        
    return Notification;
};