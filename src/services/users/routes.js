//Initial set-up
const express = require("express");
const userRoutes = express.Router();

//import controllers 
const {
    registerController,
    getAuthUserController,
    editAuthUserController,
    deleteAuthUserController,
} = require("./controller.js");