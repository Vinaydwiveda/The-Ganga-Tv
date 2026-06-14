const jwt = require("jsonwebtoken");

const auth = (...roles) => {
  return (req, res, next) => {
    try {
      // Check Authorization header first, then fall back to cookie
      let token = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = req.cookies?.token;
      }

      if (!token) {
        return res.status(401).json({
          message: "Token required",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
  };
};

module.exports = auth;