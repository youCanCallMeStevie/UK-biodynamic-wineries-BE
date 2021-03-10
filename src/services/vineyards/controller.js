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

//Middlewares
const upload = require("../../utils/cloudinary/vineyards")
const validationSchema = require("../../utils/validation/validationSchema");
const validationMiddleware = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");

//Error Handling
const ApiError = require("../../utils/ApiError");

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

  }
  