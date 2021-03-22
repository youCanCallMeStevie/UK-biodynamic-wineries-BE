//Initial set-up
const express = require("express");
const userRoutes = express.Router();

//Middlewares
const valSchema = require("../../utils/validation/validationSchema");
const validate = require("../../utils/validation/validationMiddleware");
const authorizeUser = require("../../middlewares/auth");
const upload = require("../../utils/cloudinary/users");

//import controllers
const {
  registerController,
  authUserUploadController,
  getAllUsersController,
  getUsernameController,
  searchUserController,
  getAuthUserController,
  editAuthUserController,
  deleteAuthUserController,
} = require("./controller.js");

userRoutes.post(
  "/register",
  validate(valSchema.userSchema),
  registerController
);

userRoutes.post(
  "/upload",
  authorizeUser,
  upload.single("image"),
  authUserUploadController
);

userRoutes.get("/", getAllUsersController);
userRoutes.get("/:username", getUsernameController);
userRoutes.get("/me", authorizeUser, getAuthUserController);
userRoutes.get("/search", searchUserController);
userRoutes.put("/me", authorizeUser, validate(valSchema.userSchema), editAuthUserController);
userRoutes.delete("/me", authorizeUser, deleteAuthUserController);

module.exports = userRoutes;
