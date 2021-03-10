const cloudinary = require("./config");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
//multer settings
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "BDreviews",
  },
});
const parser = multer({ storage });

module.exports = parser;