const express = require("express");
const { generateCookies } = require("../../Lib/auth/cookies");
const {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../../Lib/auth/tokens");
const authorizeUser = require("../../Middlewares/auth");
const authRoutes = express.Router();
const User = require("../../Models/User");
const passport = require("passport");
const loginSchema = require("../../Lib/validation/validationSchema")
  .loginSchema;
const validate = require("../../Lib/validation/validationMiddleware");
const { FE_URI } = process.env;