//Initial set-up
const express = require("express");
const mongoose = require("mongoose");

//Model
const UserModel = require("./schema");

//Error Handling
const ApiError = require("../../utils/ApiError");

const registerController = async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const authUserUploadController = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const image = req.file && req.file.path;
    const editedUser = await UserModel.findByIdAndUpdate(
      _id,
      { $set: { imageUrl: image } },
      { runValidators: true, new: true }
    );
    res.status(200).send({ editedUser });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getUsernameController = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username }).populate({
      path: "following followers",
    });
    if (!user) throw new ApiError(404, "There is no user with this username ");
    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


const searchUserController = async (req, res, next) => {
  try {
    const users = await UserModel.find({
      username: new RegExp(req.query.q, "i"),
    });
    if (!users) throw new ApiError(404, "There is users found");
    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllUsersController = async (req, res, next) => {
  try {
    const users = await UserModel.find().populate({
      path: "following followers reviewsGiven likedReviews likedVineyards",
    });
    console.log(users);
    if (!users) throw new ApiError(404, "No users found");
    res.status(200).send({ users });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAuthUserController = async (req, res, next) => {
  try {
    const { _id } = req.user;
    console.log("req.user", req.user);
    const currentUser = await UserModel.findById(_id).populate({
      path: "following followers",
    });
    console.log(currentUser);
    if (!currentUser)
      throw new ApiError(401, "Wrong Credentials. Please login again");
    res.status(200).send({ currentUser });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editAuthUserController = async (req, res, next) => {
  const { _id } = req.user;
  const editedUser = await UserModel.findById(_id);
  try {
    if (editedUser._id != _id)
      throw new ApiError(401, `Only the owner of this profile can edit`);
    const updatedProfile = await UserModel.findByIdAndUpdate(_id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).json({ updatedProfile });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteAuthUserController = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const deletedUser = await UserModel.findByIdAndDelete(_id);
    if (deletedUser) res.status(200).send(` deleted ${deletedUser} account`);
    throw new ApiError(404, `User not found`);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  registerController,
  authUserUploadController,
  getUsernameController,
  searchUserController,
  getAllUsersController,
  getAuthUserController,
  editAuthUserController,
  deleteAuthUserController,
};
