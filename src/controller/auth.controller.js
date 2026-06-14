const User = require("../models/user.Schema.js");
const bcrypt = require("bcrypt");

const Token = require('../utility/jsonWebToken.utility.js')
const jwt = require("jsonwebtoken")

// Register User
const RegisterUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const result = Token(user);
    res.cookie('token',result,{maxAge:1000*60*60*24*7, httpOnly: true, sameSite: 'none', secure: true})

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: result,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const result = Token(user);
    res.cookie('token',result,{maxAge:1000*60*60*24*7, httpOnly: true, sameSite: 'none', secure: true})

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const MeUser = async (req, res) => {
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
      return res.status(401).json({ success: false, message: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("name email role isActive");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  MeUser,
};
