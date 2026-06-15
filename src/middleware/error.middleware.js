// Global Express error handler for consistent API responses

const errorMiddleware = (err, req, res, _next) => {
  const status = err?.statusCode || err?.status || 500;

  // Express-validator errors are usually handled earlier, but keep a fallback.
  const validationErrors = err?.errors || err?.details;

  if (res.headersSent) {
    return;
  }

  // Multer
  if (err?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "Upload error",
      code: "MULTER_ERROR",
      errors: validationErrors || undefined,
    });
  }

  // JWT
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "JWT_INVALID",
    });
  }

  // Mongoose CastError / invalid ObjectId
  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid id format",
      code: "INVALID_ID",
      errors: validationErrors || undefined,
    });
  }

  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : err?.message || "Request failed",
    code: err?.code,
    errors: validationErrors || undefined,
  });
};

module.exports = errorMiddleware;

