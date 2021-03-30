//Initial set-up
const express = require("express");
const mongoose = require("mongoose");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");
const moment = require("moment");
const haversine = require("haversine-distance");
const sgMail = require("@sendgrid/mail");
const { MakeTime } = require("astronomy-engine");

//Imports
const getMoonInfo = require("../../utils/biodynamicApi");
const { getAddressDetails, getCoords } = require("../../utils/postionStack");
const newFollower = require("../../utils/email/newFollower.js")

//Models
const VineyardModel = require("../vineyards/schema");
const UserModel = require("../users/schema");
const ReviewModel = require("../reviews/schema");

//query to mongo
// const q2m = require("query-to-mongo");

//Error Handling
const ApiError = require("../../utils/ApiError");

const getAuthUserSavedVineyardsController = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserModel.findById(req.user._id);
      console.log("user", user);
      const vineyards = await VineyardModel.find();
      // .populate({ path: "comments authorId" })
      // .sort({ createdAt: -1 });
      const likedVineyards = vineyards.filter(vineyard =>
        user.following.includes(vineyard._id)
      );
      console.log("likedVineyards", likedVineyards);
      res.status(200).json({ likedVineyards });
    } else throw new ApiError(401, "You are not unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllVineyardsController = async (req, res, next) => {
  try {
    const vineyards = await VineyardModel.find();
    res.status(200).json({ vineyards });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getOneVineyardController = async (req, res, next) => {
  const { vineyardId } = req.params;
  try {
    const vineyard = await VineyardModel.findById(vineyardId);
    const todaysDate = new Date();
    const date = await MakeTime(todaysDate);
    const moonInfo = await getMoonInfo(date);
    res.status(200).json({ vineyard, moonInfo });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const photoVineyardController = async (req, res, next) => {
  const { vineyardId } = req.params;
  if (!(await VineyardModel.findById(vineyardId)))
    throw new ApiError(404, `Vineyard not found`);
  const imagesUris = [];
  if (req.files) {
    const files = req.files;
    files.map(file => imagesUris.push(file.path));
  }
  if (req.file && req.file.path) {
    // if only one image uploaded
    imagesUris = req.file.path;
  }
  try {
    if (!req.user._id) throw new ApiError(401, "You are unauthorized.");
    const addImage = await VineyardModel.findByIdAndUpdate(
      vineyardId,
      {
        $addToSet: { images: imagesUris },
      },
      { runValidators: true, new: true }
    );
    res.status(200).json({ edited: vineyardId, updatedAt: addImage.updatedAt });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addVineyardController = async (req, res, next) => {
  // const imagesUris = [];
  // if (!req.user._id) throw new ApiError(401, "You are unauthorized.");
  // if (req.files) {
  //   const files = req.files;
  //   files.map(file => imagesUris.push(file.path));
  // }
  // if (req.file && req.file.path) {
  //   // if only one image uploaded
  //   imagesUris = req.file.path;
  // }
  const {
    addressLine1,
    addressLine2,
    locality,
    region,
    postal_code,
    country,
  } = req.body.address;
  try {
    const fullAddress = `${addressLine1}, ${addressLine2}, ${locality}, ${region} ${postal_code} ${country}`;
    const addressDetails = await getAddressDetails(fullAddress);
    const details = addressDetails.data[0];
    const newVineyard = new VineyardModel({
      ...req.body,
      fullAddress,
      details,
      // images: imagesUris,
    });
    const { _id } = await newVineyard.save();
    res.status(200).json({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editVineyardController = async (req, res, next) => {
  try {
    const { vineyardId } = req.params;
    if (!(await VineyardModel.findById(vineyardId)))
      throw new ApiError(404, `Vineyard not found`);
    if (!req.user._id) throw new ApiError(401, "You are unauthorized.");
    const updated = await VineyardModel.findOneAndUpdate(
      { _id: vineyardId },
      req.body,
      { runValidators: true }
    );
    if (updated) {
      res.status(200).json({
        edited: vineyardId,
        updatedAt: updated.updatedAt,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteVineyardController = async (req, res, next) => {
  try {
    if (req.user._id) {
      const { vineyardId } = req.params;
      const deleteVineyard = await VineyardModel.findByIdAndDelete(
        req.params.vineyardId
      );
      if (deleteVineyard) res.status(200).send("Deleted");
      else throw new ApiError(404, "No vineyard found"); //no post was found
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const likeVineyardController = async (req, res, next) => {
  try {
    const { vineyardId } = req.params;
    const userId = req.user._id;
    if (!(await VineyardModel.findById(vineyardId)))
      throw new ApiError(404, `Vineyard not found`);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { likedVineyards: vineyardId } },
      { runValidators: true, new: true }
    );

    const likedVineyard = await VineyardModel.findByIdAndUpdate(vineyardId, {
      $addToSet: { likes: userId },
    });
    res.status(200).json({ vineyardId });

    if (user.publicProfile === true) {
      const vineyard = await VineyardModel.findById(vineyardId);
      if (!vineyard.prevEmailed.includes(userId)) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: "flanagan.stephanie@gmail.com",
          from: `${user.email}`,
          subject: `${user.name} just followed ${likedVineyard.name}`,
          text: "strive school",
          html: newFollower(user.name, likedVineyard.name),
        };
        const emailed = await VineyardModel.findByIdAndUpdate(
          vineyardId,
          { $addToSet: { prevEmailed: userId } },
          { runValidators: true, new: true }
        );
        await sgMail.send(msg);
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const unlikeVineyardController = async (req, res, next) => {
  try {
    const { vineyardId } = req.params;
    const userId = req.user._id;
    if (!(await VineyardModel.findById(vineyardId)))
      throw new ApiError(404, `Vineyard not found`);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { likedVineyards: vineyardId } },
      { runValidators: true, new: true }
    );
    const unlikedVineyard = await VineyardModel.findByIdAndUpdate(vineyardId, {
      $pull: { likes: userId },
    });
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const searchVineyardsController = async (req, res, next) => {
  const { city, grapes } = req.query;
  try {
    const vineyards = await VineyardModel.find();
    let filteredList = vineyards;
    if (city) {
      const citySearch = city.toLowerCase();
      console.log("citySearch", citySearch);
      const coord = await getCoords(citySearch);
      filteredList = vineyards.filter(vineyard =>
        vineyard.region.toLowerCase().includes(citySearch)
      );
    }
    if (grapes) {
      console.log("grapes", grapes);
      filteredList = vineyards.filter(vineyard =>
        vineyard.grapes.includes(grapes)
      );
    }
    if (!req.query.date) {
      const todaysDate = new Date();
      const date = await MakeTime(todaysDate);
      // const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      console.log("date from controller", date);
      let moonInfo = await getMoonInfo(date);
    } else {
      const searchDate = new Date(req.query.date);
      const date = await MakeTime(searchDate);
      console.log("date from search with date controller", date);
      let moonInfo = await getMoonInfo(date);
    }
    res.status(200).json({ results: filteredList });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const todaysInfo= async (req, res, next)=>{
  try {
    const todaysDate = new Date();
    const date = await MakeTime(todaysDate);
    // const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    console.log("date from controller", date);
    let moonInfo = await getMoonInfo(date);
    res.status(200).json({ moonInfo });

  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = {
  getAllVineyardsController,
  getOneVineyardController,
  getAuthUserSavedVineyardsController,
  addVineyardController,
  photoVineyardController,
  editVineyardController,
  deleteVineyardController,
  likeVineyardController,
  unlikeVineyardController,
  searchVineyardsController,
  todaysInfo
};
