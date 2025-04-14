const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mat_khau_jwt_cua_ban";

// Middleware kiểm tra JWT
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Không có token, truy cập bị từ chối" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
};

exports.authorize = (roles = []) => {
  if (typeof roles === "string") roles = [roles];
  return [
    exports.authenticate,
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Bạn không có quyền truy cập" });
      }
      next();
    },
  ];
};

exports.getUserRole = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Không có token" });
    try {
        console.log('Verifying token with secret:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.role = decoded.role; // Chủ trọ | Khách thuê
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token không hợp lệ" });
  }
};
