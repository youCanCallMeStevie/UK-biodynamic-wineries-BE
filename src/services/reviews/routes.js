//Initial set-up
const express = require("express");
const reviewRoutes = express.Router();


//Middlewares
const reviewSchema = require("../../utils/validation/validationSchema");
const validate = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");

//import controllers 
const {
    postReviewController,
    getVineyardReviewsController,
    editReviewController,
    deleteReviewController,
    likeReviewController,
    unlikeReviewController
} = require("./controller.js");