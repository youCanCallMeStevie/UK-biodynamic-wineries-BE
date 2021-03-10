//Initial set-up
const express = require("express");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");

//Middlewares
const {vineyardSchema} = require("../../utils/validation/validationSchema");
const validate = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");
const upload = require("../../utils/cloudinary/vineyards");


//import controllers from
const {
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
    searchVineyardResultsController
} = require("./controller.js");

//imported routes
vineyardRoutes.use("/reviews", reviewRoutes);


//all liked vineyards on signed in user's list
vineyardRoutes.get("/me", authorizeUser, getAuthUserSavedVineyardsController);

//get all vineyards on database
vineyardRoutes.get("/", getAllVineyardsController);


//edit a specific vineyard, according to the schema
vineyardRoutes.get("/:vineyardId", authorizeUser, validate(vineyardSchema), editVineyardController);


//delete a specific vineyard
vineyardRoutes.delete("/:vineyardId", authorizeUser, deleteVineyardController)


//Add a vineyard to your liked list
vineyardRoutes.post("/:vineyardId/like", authorizeUser, likeVineyardController);


//Remove a vineyard to your liked list
vineyardRoutes.post("/:vineyardId/like", authorizeUser, unlikeVineyardController);


module.exports = vineyardRoutes;
