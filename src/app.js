require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");

const authrouter = require("./router/auth.router");
const newsrouter = require("./router/news.router");
const websitesettingrouter = require("./router/website.setting.router");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authrouter);
app.use("/api/news", newsrouter);
app.use("/api/settings", websitesettingrouter);

module.exports = app;