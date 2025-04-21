// models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "/../config/config.json"))[env];
const db = {};

let sequelize;
if (config.dialect === "sqlite") {
  // Chạy test với SQLite in‑memory (config.test ở config.json phải có storage: ":memory:")
  sequelize = new Sequelize({
    dialect: config.dialect,
    storage: config.storage, // ví dụ ":memory:"
    logging: config.logging ?? false,
  });
} else if (config.use_env_variable) {
  // Ví dụ production hoặc khi dùng CLEARDB_DATABASE_URL
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Môi trường development / test nếu vẫn dùng MySQL
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Tự load model
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      !file.endsWith(".test.js")
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Thiết lập association nếu có
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
