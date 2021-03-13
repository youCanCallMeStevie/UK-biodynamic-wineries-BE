//Initial set-up
const express = require("express");
const reviewRoutes = express.Router();


//Middlewares
const valSchema = require("../../utils/validation/validationSchema");
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

reviewRoutes.post(
    "/:vineyardId",
    authorizeUser,
    validate(valSchema.reviewSchema), postReviewController);

reviewRoutes.get("/:vineyardId", getVineyardReviewsController);

reviewRoutes.put(
    "/:reviewId",
    authorizeUser,
    validate(valSchema.reviewSchema), editReviewController);

reviewRoutes.delete(
        "/:vineyardId/:reviewId",
        authorizeUser, deleteReviewController);

reviewRoutes.post("/:reviewId/like", authorizeUser, likeReviewController);

reviewRoutes.put("/:reviewId/unlike", authorizeUser, unlikeReviewController);

module.exports = reviewRoutes;
