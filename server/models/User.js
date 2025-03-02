module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "owner", "tenant"),
        defaultValue: "tenant",
      },
      emailToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "Users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          const bcrypt = require("bcryptjs");
          user.password = await bcrypt.hash(user.password, 10);
        },
      },
    }
  );

  // Định nghĩa các associations nếu cần
  User.associate = function (models) {
    // Ví dụ: User.hasMany(models.Post);
  };

  return User;
};
