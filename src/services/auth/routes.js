//Initial set-up
const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");

//Middlewares
const loginSchema = require("../../utils/validation/validationSchema");
const validate = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");

//import controllers from
const {
    loginController,
    refreshController,
    logoutController,
    googleCallBackController
} = require("./controller.js");


authRoutes.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  authRoutes.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }), googleCallBackController)