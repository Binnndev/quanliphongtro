module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "Room",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("vacant", "rented"),
        defaultValue: "vacant",
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amenities: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Rooms",
      timestamps: true,
    }
  );

  return Room;
};
