//Initial set-up
const express = require("express");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");
let nodeGeocoder = require("node-geocoder");
const haversine = require("haversine-distance");
const moment = require("moment");

//Models
const VineyardModel = require("../vineyards/schema");
const UserModel = require("../user/schema");
const ReviewModel = require("../reviews/schema");

//query to mongo
const q2m = require("query-to-mongo");

//Error Handling
const ApiError = require("../../utils/ApiError");


let options = {
  provider: "openstreetmap",
};
let geoCoder = nodeGeocoder(options);

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

      res.status(200).send(likedVineyards);
    } else throw new ApiError(401, "You are not unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAllVineyardsController = async (req, res, next) => {
  try {
    const vineyards = await VineyardModel.find();
    res.status(200).send(vineyards);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// const photoVineyardController = async (req, res, next) => {
//   try {
//       const user = req.user._id;
//       if (user) {
//         const image = req.file && req.file.path;
//         console.log("image", image);
//         const addImage = await VineyardModel({
//           ...req.body,
//           image,
//           authorId: user,
//         });
//         const { _id } = await newPost.save();
//         res.status(200).send({ newPost });
//       } else throw new ApiError(401, "You are unauthorized.");
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   }

const addVineyardController = (req, res, next) => {
const imagesUris = [];
if (! req.user._id) throw new ApiError(401, "You are unauthorized.");

      if (req.files) {
        const files = req.files;
        files.map((file) => imagesUris.push(file.path));
      }
      if (req.file && req.file.path) {
        // if only one image uploaded
        imagesUris = req.file.path; // add the single
      }
      const { addressLine1, addressLine2, city, postcode } = req.body;
      try {
        let address = await geoCoder.geocode(
          `${addressLine1} ${addressLine2} ${city} ${postcode}`
        );
        const newListing = new VineyardModel({
          ...req.body,
          address,
          images: imagesUris,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        newListing.save();
        res.send(newListing);
} catch (error) {
        console.log(error);
next(error)
      }
    }


const editVineyardController = async (req, res, next) => {
  if (! req.user._id) throw new ApiError(401, "You are unauthorized.");
  const imagesUris = [];
    if (req.files) {
      const files = req.files;
      files.map((file) => imagesUris.push(file.path));
    }
    if (req.file && req.file.path) {
      // if only one image uploaded
      imagesUris = req.file.path; // add the single
    }
    const { addressLine1, addressLine2, city, postcode } = req.body;
    try {

     const { vineyardId } = req.params;
    if (!(await VineyardModel.findById(vineyardId)))
     throw new ApiError(404, `Vineyard not found`);
      let address = await geoCoder.geocode(
        `${addressLine1} ${addressLine2} ${city} ${postcode}`
        );
      const editedVineyard = {
        ...req.body,
        address,
        images: imagesUris,
        updatedAt: Date.now(),
      };
      const vineyardToEdit = await VineyardModel.findByIdAndUpdate(id, editedListing);
      res.send({
        edited: editedVineyard._id,
        updatedAt: vineyardToEdit.updatedAt,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  const deleteVineyardController   = async (req, res, next) => {
    
    try {
      if(req.user._id){
      const { vineyardId } = req.params;
      const deleteVineyard = await VineyardModel.findByIdAndDelete(req.params.vineyardId);
      if (deleteVineyard) res.status(200).send("Deleted");
      else throw new ApiError(404, "No vineyard found"); //no post was found
    } else throw new ApiError(401, "You are unauthorized.");
    } catch (error) {
   console.log(error)
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
      res.status(200).send({ vineyardId });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

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
          res.status(200).send({ vineyardId });
        } catch (error) {
          console.log(error);
          next(error);
        }
      }

const searchVineyardCityController = async (req, res, next) => {
      try {
        const result = await geoCoder.geocode(req.query.city);
        const lat = result[0].latitude;
        const long = result[0].longitude;
        const cords1 = [long, lat];
        let results = await VineyardModel.find();
        results = await results.filter((result) => result.address);
        results = results.filter(
          (loc) =>
            haversine(cords1, [loc.address[0].longitude, loc.address[0].latitude]) <
            40000
        );
        res.status(200).send({ results });

      } catch (error) {
        console.log(error);
        next(error);
      }
    }


    const searchVineyardResultsController = async (req, res, next) => {
      const {city} = req.query
      try {
      const vineyards = await VineyardModel.find();
        let filterList = listings;
    
        if (city) {
          const coord = await geoCoder.geocode(city);
          const lat = coord[0].latitude;
          const long = coord[0].longitude;
          const cords1 = [long, lat];
          filterList = await vineyards.filter((result) => result.address);
          filterList = filterList.filter(
            (loc) =>
              haversine(cords1, [
                loc.address[0].longitude,
                loc.address[0].latitude,
              ]) < 40000
          );
        }
        console.log("filterList", filterList);
        res.status(200).send({ filterList });

      } catch (error) {
        console.log(error);
        next(error);
      }

    }

module.exports = {
  getAllVineyardsController,
  getAuthUserSavedVineyardsController,
  addVineyardController,
  photoVineyardController,
  editVineyardController,
  deleteVineyardController,
  likeVineyardController,
  unlikeVineyardController,
  visitedVineyardController,
  searchVineyardCityController,
  searchVineyardResultsController,
};
