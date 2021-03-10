//Initial set-up
const express = require("express");
const reviewRoutes = express.Router();

//import controllers 
const {
    postReviewController,
    getVineyardReviewsController,
    editReviewController,
    deleteReviewController,
    likeReviewController,
    unlikeReviewController
} = require("./controller.js");