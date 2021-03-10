//Initial set-up
const express = require("express");
const reviewRoutes = express.Router();
const mongoose = require("mongoose");
const q2m = require("query-to-mongo");

//Model
const ReviewModel = require("./schema");
const VineyardModel = require("../vineyards/schema");
const UserModel = require("../users/schema");

//Middlewares
const validationSchema = require("../../utils/validation/validationSchema");
const validationMiddleware = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");

//Error Handling
const ApiError = require("../../utils/ApiError");



//post new comment
reviewRoutes.post(
    "/:vineyardId",
    authorizeUser,
    validationMiddleware(validationSchema.reviewSchema),
    async (req, res, next) => {
      const { vineyardId } = req.params;
      const user = req.user.username;
      try {
        if (!(await VineyardModel.findById(vineyardId)))
          throw new ApiError(404, `post not found`);
        const newReview = new ReviewModel(req.body);
        newReview.userId = user;
        const { _id } = await newReview.save();
        const comment = await VineyardModel.findByIdAndUpdate(
          vineyardId,
          { $addToSet: { comments: _id } },
          { runValidators: true, new: true }
        );
        res.status(200).send({ _id });
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );
  
  //retrieve all comments for a specific post
  reviewRoutes.get("/:vineyardId", async (req, res, next) => {
    try {
      const { vineyardId } = req.params;
      if (vineyardId) {
        const post = await VineyardModel.findOne({ _id: vineyardId }).populate({
          path: "comments",
        }).sort({'createdAt': -1});
        console.log("XX Post", post);
        if (post) {
          res.status(200).send(post);
        } else res.status(200).json({ message: "no comments for this post" });
      } else throw new ApiError(404, "no post found");
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
  
  //owner to edit their own comment on a specific post
  reviewRoutes.put(
    "/:reviewId",
    authorizeUser,
    validationMiddleware(validationSchema.reviewSchema),
    async (req, res, next) => {
      const { reviewId } = req.params;
      const user = req.user;
      const reviewToEdit = await ReviewModel.findById(reviewId);
      try {
        if (reviewToEdit.userId != user.username)
          throw new ApiError(401, `Only the owner of this comment can edit`);
        const updatedComment = await ReviewModel.findByIdAndUpdate(
          reviewId,
          req.body,
          {
            runValidators: true,
            new: true,
          }
        );
        res.status(200).json({ updatedComment });
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );
  
  //owner to delete their own comment on a specific post
  reviewRoutes.delete(
    "/:vineyardId/:reviewId",
    authorizeUser,
    async (req, res, next) => {
      const { reviewId, vineyardId } = req.params;
      const user = req.user;
      const reviewToEdit = await ReviewModel.findById(reviewId);
      try {
        if (reviewToEdit.userId != user.username)
          throw new ApiError(401, `Only the owner of this comment can edit`);
        if (!(await ReviewModel.findById(reviewId)))
          throw new ApiError(404, `Comment not found`);
        const post = await VineyardModel.findByIdAndUpdate(
          vineyardId,
          { $pull: { comments: reviewId } },
          { runValidators: true, new: true }
        );
        const deletedComment = await ReviewModel.findByIdAndDelete(reviewId);
        res.status(200).send("Deleted");
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );
  
  //Like a post
  reviewRoutes.post(
    "/:reviewId/like",
    authorizeUser,
    async (req, res, next) => {
      try {
        const { reviewId } = req.params;
        const userId = req.user._id;
        if (!(await ReviewModel.findById(reviewId)))
          throw new ApiError(404, `Comment not found`);
        const user = await UserModel.findByIdAndUpdate(
          userId,
          { $addToSet: { likedComments: reviewId } },
          { runValidators: true, new: true }
        );
        const likedPost = await ReviewModel.findByIdAndUpdate(reviewId, {
          $addToSet: { likes: req.user.username },
        });
        res.status(200).send({ reviewId });
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );
  
  //Unlike a comment
  reviewRoutes.put(
    "/:reviewId/unlike",
    authorizeUser,
    async (req, res, next) => {
      try {
        const { reviewId } = req.params;
        const userId = req.user._id;
        if (!(await ReviewModel.findById(reviewId)))
          throw new ApiError(404, `Comment not found`);
        const user = await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { likedComments: reviewId } },
          { runValidators: true, new: true }
        );
        const unlikedComment = await ReviewModel.findByIdAndUpdate(reviewId, {
          $pull: { likes: req.user.username },
        });
        res.status(200).send({ reviewId });
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );
  
  module.exports = {
    postReviewController,
    getVineyardReviewsController,
    editReviewController,
    deleteReviewController,
    likeReviewController,
    unlikeReviewController
  }