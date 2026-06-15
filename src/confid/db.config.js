const mongoose = require("mongoose");

const db = async () => {
  await mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("db connected successfully");
    })
    .catch((err) => {
      console.error("Mongo connection failed:", err);
      process.exit(1);
    });
};

module.exports = db;


