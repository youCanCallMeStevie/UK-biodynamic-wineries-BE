//Initial set-up
const express = require("express");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");

//Models
const VineyardModel = require("../vineyards/schema");
const UserModel = require("../user/schema");
const ReviewModel = require("../reviews/schema");

//query to mongo
const q2m = require("query-to-mongo");

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

// const addVineyardController = (req, res, next) => {
// const imagesUris = [];
//       if (req.files) {
//         const files = req.files;
//         files.map((file) => imagesUris.push(file.path));
//       }
//       if (req.file && req.file.path) {
//         // if only one image uploaded
//         imagesUris = req.file.path; // add the single
//       }
//       const { street, city, state, country, zip } = req.body;
//       try {
//         let address = await geoCoder.geocode(
//           `${street} ${city} ${zip} ${state} ${country} `
//         );
//         let amenities = await req.body.amenities.split(",");

//         const newListing = new Listing({
//           ...req.body,
//           address,
//           images: imagesUris,
//           amenities,
//           host: req.user.id,
//           createdAt: Date.now(),
//           updatedAt: Date.now(),
//         });
//         newListing.save();
//         res.send(newListing);
//       } catch (err) {
//         console.log(err);
//       }
//     }

const editVineyardController = async (req, res, next) => {
  try {
    if (req.user._id) {
      const editedVineyard = await VineyardModel.findByIdAndUpdate(
        req.params.vineyardId,
        req.body,
        { runValidators: true }
      );
      if (editedVineyard) {
        res.status(200).send(editedVineyard);
      }
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
};


const deleteVineyardController = async (req, res, next) => {
  try {
    if (req.user._id) {
      const deleteVineyard = await VineyardModel.findByIdAndDelete(req.params.vineyardId);
      if (deleteVineyard) res.status(200).send("Deleted");
      else throw new ApiError(404, "No vineyard found");
    } else throw new ApiError(401, "You are unauthorized.");
  } catch (error) {
    console.log(error);
    next(error);
  }
}

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
