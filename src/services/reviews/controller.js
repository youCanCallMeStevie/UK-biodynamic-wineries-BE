//Initial set-up
const express = require("express");
const mongoose = require("mongoose");

//Model
const ReviewModel = require("./schema");
const VineyardModel = require("../vineyards/schema");
const UserModel = require("../users/schema");

//Error Handling
const ApiError = require("../../utils/ApiError");

//post new comment
const postReviewController = async (req, res, next) => {
  const { vineyardId } = req.params;
  const user = req.user._id;
  try {
    if (!(await VineyardModel.findById(vineyardId)))
      throw new ApiError(404, `post not found`);
    const newReview = new ReviewModel(req.body);
    newReview.userId = user;
    const { _id } = await newReview.save();
    const review = await VineyardModel.findByIdAndUpdate(
      vineyardId,
      { $addToSet: { reviews: _id } },
      { runValidators: true, new: true }
    );
    res.status(200).send({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//retrieve all comments for a specific post
const getVineyardReviewsController = async (req, res, next) => {
  try {
    const { vineyardId } = req.params;
    if (vineyardId) {
      const vineyard = await VineyardModel.findOne({ _id: vineyardId })
        .populate({
          path: "reviews",
        })
        .sort({ createdAt: -1 });
      if (vineyard) {
        res.status(200).send(vineyard.reviews);
      } else res.status(200).json({ message: "no reviews for this vineyard" });
    } else throw new ApiError(404, "no vineyard found");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//owner to edit their own comment on a specific post
const editReviewController = async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user._id;
  const reviewToEdit = await ReviewModel.findById(reviewId);
  try {
    if (reviewToEdit.userId != userId)
      throw new ApiError(401, `Only the owner of this review can edit`);
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
};

//owner to delete their own comment on a specific post
const deleteReviewController = async (req, res, next) => {
  const { reviewId, vineyardId } = req.params;
  const userId = req.user._id;
  const reviewToEdit = await ReviewModel.findById(reviewId);
  try {
    if (reviewToEdit.userId != userId)
      throw new ApiError(401, `Only the owner of this review can delete`);
    if (!(await ReviewModel.findById(reviewId)))
      throw new ApiError(404, `Review not found`);
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
};

//Like a post
const likeReviewController = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    if (!(await ReviewModel.findById(reviewId)))
      throw new ApiError(404, `Review not found`);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { likedComments: reviewId } },
      { runValidators: true, new: true }
    );
    const likedReview = await ReviewModel.findByIdAndUpdate(reviewId, {
      $addToSet: { likes: req.user._id },
    });
    res.status(200).send({ reviewId });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Unlike a comment
const unlikeReviewController = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    if (!(await ReviewModel.findById(reviewId)))
      throw new ApiError(404, `Review not found`);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { likes: reviewId } },
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
};

module.exports = {
  postReviewController,
  getVineyardReviewsController,
  editReviewController,
  deleteReviewController,
  likeReviewController,
  unlikeReviewController,
};
