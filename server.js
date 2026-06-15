const dotenv = require("dotenv").config();
const app = require("./src/app.js");
const db = require("./src/confid/db.config.js");

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

async function start() {
  // Config validation (Phase 0)
  requireEnv("PORT");
  requireEnv("JWT_SECRET");
  requireEnv("IMAGEKIT_PUBLIC_KEY");
  requireEnv("IMAGEKIT_PRIVATE_KEY");
  requireEnv("IMAGEKIT_URL_ENDPOINT");
  requireEnv("DB_URI");

  await db();

  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}

start().catch((err) => {
  console.error("Startup failed:", err?.message || err);
  process.exit(1);
});

    
