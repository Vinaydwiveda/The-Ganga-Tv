// dotenv is usually loaded at process startup (server.js). Keep app.js framework-only.

const express = require("express");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "https://the-gangatv.netlify.app",
  credentials: true,
};

// Routers are required lazily inside the app to avoid importing services
// that depend on external config (ImageKit keys) during app boot.


const app = express();

// Request logging (with request-id)
app.use((req, _res, next) => {
  const incoming = req.headers["x-request-id"];
  req.requestId = incoming || `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Request-Id", req.requestId);
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      `[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`
    );
  });
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health endpoints
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.get("/ready", async (_req, res) => {
  try {
    const mongoose = require("mongoose");
    const state = mongoose.connection.readyState; // 0=disconnected, 1=connected

    if (state === 1) {
      return res.status(200).json({ success: true, message: "READY" });
    }

    return res
      .status(503)
      .json({ success: false, message: "MongoDB not ready" });
  } catch (e) {
    return res
      .status(503)
      .json({ success: false, message: "Mongo check failed" });
  }
});


const authrouter = require("./router/auth.router");
const newsrouter = require("./router/news.router");
const websitesettingrouter = require("./router/website.setting.router");

app.use("/api/auth", authrouter);
app.use("/api/news", newsrouter);
app.use("/api/settings", websitesettingrouter);

// Global error handler (Phase 2)
const errorMiddleware = require("./middleware/error.middleware.js");
app.use(errorMiddleware);

module.exports = app;




