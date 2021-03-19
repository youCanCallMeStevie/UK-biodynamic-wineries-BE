//Initial set-up
const express = require("express");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");
const moment = require("moment");
const haversine = require("haversine-distance");
const { getAddressDetails, getCoords } = require("../../utils/postionStack");
const getMoonInfo = require("../../utils/biodynamicApi");


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
    res.status(200).json({ vineyard });
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
      $addToSet: { likes: req.user._id },
    });
    res.status(200).json({ vineyardId });
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
      //       filterList = await vineyards.filter(
      //         vineyard =>
      //           haversine(cords1, [
      //             vineyard.details.longitude,
      //             vineyard.details.latitude,
      //           ]) < 40000
      //       );
      //     }
      filteredList = await VineyardModel.filter(vineyard =>
        vineyard.region.toLowerCase().includes(citySearch)
      );
    }
    if (grapes) {
      console.log("grapes", grapes);
      filteredList = await vineyards.filter(vineyard =>
        vineyard.grapes.includes(grapes)
      );
    }
    if (!req.query.date) {
      const todaysDate = new Date();
      const date = parseFloat(moment(todaysDate).format("YYYY-MM-DD"));
      console.log("searchVineyardsController date", date);
      let moonInfo = await getMoonInfo(date);
    } else {
      const date =
        req.query.date && parseFloat(moment(req.query.date).format("YYYY-MM-DD"));
      let moonInfo = await getMoonInfo(date);
    }
    res.status(200).json({ results: filteredList });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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
};
