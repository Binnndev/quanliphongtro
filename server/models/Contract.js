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
            MaPhong: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            NgayLap: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            
            TienCoc: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            TrangThai: {
                type: DataTypes.ENUM("Có hiệu lực", "Hết hiệu lực", "Đã hủy"),
                defaultValue: "Có hiệu lực",
            },
            MaKhachThue: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "KhachThue",
                    key: "MaKhachThue",
                },
            },
            FileHopDong: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            
        
        },
        {
            sequelize,
            tableName: "HopDong",
            timestamps: false,
        });
    
        Contract.associate = function(models) {
            // Định nghĩa association ở đây nếu cần
            Contract.belongsTo(models.Tenant, { foreignKey: 'MaKhachThue' });
            Contract.belongsTo(models.Room, { foreignKey: 'MaPhong' });
          };
        
    return Contract;
};