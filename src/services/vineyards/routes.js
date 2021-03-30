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
    getOneVineyardController,
    getAuthUserSavedVineyardsController,
    addVineyardController,
    editVineyardController,
    deleteVineyardController,
    likeVineyardController,
    unlikeVineyardController,
    searchVineyardsController,
    photoVineyardController,
    todaysInfo
} = require("./controller.js");

//imported routes
vineyardRoutes.use("/reviews", reviewRoutes);


//all liked vineyards on signed in user's list
vineyardRoutes.get("/me", authorizeUser, getAuthUserSavedVineyardsController);

//get all vineyards on database
vineyardRoutes.get("/today/mooninfo", todaysInfo);

//get all vineyards on database
vineyardRoutes.get("/", getAllVineyardsController);

//get one vineyard from  database
vineyardRoutes.get("/:vineyardId", getOneVineyardController);

//search vineyards on database
vineyardRoutes.get("/search/results", searchVineyardsController);


//add vineyard, according to the schema
vineyardRoutes.post("/", authorizeUser, validate(valSchema.vineyardSchema), addVineyardController);


//edit a specific vineyard, according to the schema
vineyardRoutes.put("/:vineyardId", 
authorizeUser, 
validate(valSchema.vineyardSchema), 
 editVineyardController);

//add photo to specific, according to the schema
vineyardRoutes.post("/:vineyardId/upload", authorizeUser, 
 upload.array("images"), photoVineyardController);


//delete a specific vineyard
vineyardRoutes.delete("/:vineyardId", authorizeUser, deleteVineyardController)


//Add a vineyard to your liked list
vineyardRoutes.post("/:vineyardId/like", authorizeUser, likeVineyardController);


//Remove a vineyard to your liked list
vineyardRoutes.put("/:vineyardId/unlike", authorizeUser, unlikeVineyardController);


module.exports = vineyardRoutes;
