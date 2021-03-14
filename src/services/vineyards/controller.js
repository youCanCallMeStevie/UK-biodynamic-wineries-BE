//Initial set-up
const express = require("express");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");
// const NodeGeocoder = require('node-geocoder');
// let options = {
//   provider: "openstreetmap",
// };
// let geocoder = NodeGeocoder(options);
const haversine = require("haversine-distance");
const moment = require("moment");
const { getAddressDetails } = require("../../utils/postionStack");

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
  const imagesUris = [];
  if (!req.user._id) throw new ApiError(401, "You are unauthorized.");
  if (req.files) {
    const files = req.files;
    files.map(file => imagesUris.push(file.path));
  }
  if (req.file && req.file.path) {
    // if only one image uploaded
    imagesUris = req.file.path;
  }
  const {
    addressLine1,
    addressLine2,
    locality,
    region,
    postal_code,
    country,
  } = req.body.address;
  try {
    const address = `${addressLine1}, ${addressLine2}, ${locality}, ${region} ${postal_code} ${country}`;
    const addressDetails = await getAddressDetails(address);
    const details = addressDetails.data[0];
    const newVineyard = new VineyardModel({
      ...req.body,
      address: { details, address },
      images: imagesUris,
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
    const {
      addressLine1,
      addressLine2,
      locality,
      region,
      postal_code,
      country,
    } = req.body.address;
    const address = `${addressLine1}, ${addressLine2}, ${locality}, ${region} ${postal_code} ${country}`;
    const addressDetails = await getAddressDetails(address);
    const details = addressDetails.data[0];

    const editedVineyard = {
      ...req.body,
      address: { details, address },
    };
    console.log("editedVineyard", editedVineyard);
    const vineyardToEdit = await VineyardModel.findByIdAndUpdate(
      vineyardId,
      editedVineyard,
      { runValidators: true }
    );
    if (vineyardToEdit) {
      res.status(200).json({
        edited: editedVineyard._id,
        updatedAt: vineyardToEdit.updatedAt,
      });
    } else throw new ApiError(401, "You are unauthorized.");
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
      { $pull: { likedPosts: vineyardId } },
      { runValidators: true, new: true }
    );
    const unlikedVineyard = await VineyardModel.findByIdAndUpdate(vineyardId, {
      $pull: { likes: userId },
    });
    res.status(200).json({ vineyardId });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const searchVineyardCityController = async (req, res, next) => {
  try {
    const result = await geocoder.geocode(req.query.city);
    const lat = result[0].latitude;
    const long = result[0].longitude;
    const cords1 = [long, lat];
    let results = await VineyardModel.find();
    results = await results.filter(result => result.address);
    results = results.filter(
      loc =>
        haversine(cords1, [loc.address[0].longitude, loc.address[0].latitude]) <
        40000
    );
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const searchVineyardResultsController = async (req, res, next) => {
  const { city } = req.query;
  try {
    const vineyards = await VineyardModel.find();
    let filterList = listings;

    if (city) {
      const coord = await geocoder.geocode(city);
      const lat = coord[0].latitude;
      const long = coord[0].longitude;
      const cords1 = [long, lat];
      filterList = await vineyards.filter(result => result.address);
      filterList = filterList.filter(
        loc =>
          haversine(cords1, [
            loc.address[0].longitude,
            loc.address[0].latitude,
          ]) < 40000
      );
    }
    console.log("filterList", filterList);
    res.status(200).json({ filterList });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  getAllVineyardsController,
  getAuthUserSavedVineyardsController,
  addVineyardController,
  // photoVineyardController,
  editVineyardController,
  deleteVineyardController,
  likeVineyardController,
  unlikeVineyardController,
  // visitedVineyardController,
  searchVineyardCityController,
  searchVineyardResultsController,
};
