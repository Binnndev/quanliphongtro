const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";

// Middleware kiểm tra xác thực
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Định dạng: "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: "Từ chối truy cập. Không có token." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (ex) {
    return res.status(400).json({ error: "Token không hợp lệ" });
  }
};

// Middleware phân quyền: cho phép các vai trò cụ thể truy cập
exports.authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }
  return [
    exports.authenticate,
    (req, res, next) => {
      if (roles.length && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ error: "Truy cập bị cấm: Bạn không có quyền." });
      }
      next();
    },
  ];
};
