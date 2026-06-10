const jwt = require("jsonwebtoken");

const auth = (...roles) => {
  return (req, res, next) => {
    try {
      const token = req.cookies.token;

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