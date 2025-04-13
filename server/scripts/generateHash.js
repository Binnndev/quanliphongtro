const bcrypt = require("bcryptjs");
const plainPassword = "123456"; // hoặc mật khẩu bạn muốn hash
bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) {
    console.error("Lỗi khi tạo hash:", err);
    process.exit(1);
  }
  console.log("Hash của mật khẩu:", hash);
});
