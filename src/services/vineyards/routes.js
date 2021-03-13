//Initial set-up
const express = require("express");
const vineyardRoutes = express.Router();
const reviewRoutes = require("../reviews/routes");

//Middlewares
const valSchema = require("../../utils/validation/validationSchema");
const validate = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");
const upload = require("../../utils/cloudinary/vineyards");


//import controllers from
const {
    getAllVineyardsController,
    getAuthUserSavedVineyardsController,
    addVineyardController,
    editVineyardController,
    deleteVineyardController,
    likeVineyardController,
    unlikeVineyardController,
    searchVineyardCityController,
    // searchVineyardResultsController
} = require("./controller.js");

//imported routes
vineyardRoutes.use("/reviews", reviewRoutes);


//all liked vineyards on signed in user's list
vineyardRoutes.get("/me", authorizeUser, getAuthUserSavedVineyardsController);

//get all vineyards on database
vineyardRoutes.get("/", getAllVineyardsController);

//search vineyards on database
vineyardRoutes.get("/search/city", searchVineyardCityController);


//add vineyard, according to the schema
vineyardRoutes.post("/:", authorizeUser, validate(valSchema.vineyardSchema), upload.array("images"), addVineyardController);


//edit a specific vineyard, according to the schema
vineyardRoutes.put("/:vineyardId", authorizeUser, validate(valSchema.vineyardSchema), upload.array("images"), editVineyardController);


//delete a specific vineyard
vineyardRoutes.delete("/:vineyardId", authorizeUser, deleteVineyardController)


//Add a vineyard to your liked list
vineyardRoutes.post("/:vineyardId/like", authorizeUser, likeVineyardController);


//Remove a vineyard to your liked list
vineyardRoutes.post("/:vineyardId/like", authorizeUser, unlikeVineyardController);


module.exports = vineyardRoutes;
