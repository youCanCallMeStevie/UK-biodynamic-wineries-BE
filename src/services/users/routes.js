//Initial set-up
const express = require("express");
const userRoutes = express.Router();

//Middlewares
const userSchema = require("../../utils/validation/validationSchema");
const validate = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");

//import controllers 
const {
    registerController,
    getAuthUserController,
    editAuthUserController,
    deleteAuthUserController,
} = require("./controller.js");