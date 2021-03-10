const express = require("express");
const { generateCookies } = require("../../utils/auth/cookies");
const {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../../utils/auth/tokens");
const UserModel = require("../users/schema");

const { FE_URI } = process.env;


authRoutes.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    console.log(user);
    if (!user) throw error;
    if (user) {
      const isValid = user.comparePass(password);
      console.log(isValid)
      //if it's valid, generate jwt
      const tokens = await generateTokens(user);
      //send cookies
      if (!tokens) throw error;
      else {
        const cookies = await generateCookies(tokens, res);
        res.send(tokens);
      }
    }
  } catch (err) {
    const error = new Error("Wrong Credentials");
    error.code = 401;
    next(error);
  }
});

authRoutes.post("/refresh", async (req, res, next) => {
  try {
    //validate and deode refreh token
    const user = await verifyRefreshToken(req);
    if (!user) throw error;
    //if there is a user, re-generate tokens and cookies
    const tokens = await generateTokens(user);
    //send cookies
    if (!tokens) throw error;
    else {
      const cookies = await generateCookies(tokens, res);
      res.send(tokens);
    }
  } catch (err) {
    const error = new Error("User not authorized. Please login in");
    error.code = 401;
    next(error);
  }
});

authRoutes.post("/logout", authorizeUser, async (req, res, next) => {
  try {
    const clearCookies = await clearCookies(res);
    res.send("Logout");
  } catch (err) {
    const error = new Error("Wrong Credentials");
    error.code = 401;
    next(error);
  }
});

//GOOGLE AUTH

//LOGIN GOOGLE
const googleCallBackController =
  async (req, res, next) => {
    try {
      console.log(req.user);
      const { tokens } = req.user;
      const cookies = await generateCookies(tokens, res);
      //verify credentials
      res.redirect(FE_URI);
    } catch (err) {
      next(err);
    }
  }

  module.exports = {
    loginController,
    refreshController,
    logoutController,
    googleCallBackController

  }