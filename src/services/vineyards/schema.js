const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const VineyardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, required: false },
      city: { type: String, required: true },
      postcode: { type: String, required: true },
    },
    description: String,
    bio: String,
    region: String,
    images: Array,
    rate: Number,
    grapes: Array,
    styles: [
      {
        type: String,
        enum: [
          "Red",
          "White",
          "Sparking",
          "Orange",
          "Fortified",
          "Sweet",
          "Beer",
          "Cider",
        ],
        default: [],
      },
    ],
    guidedTours: Boolean,
    guidedTastings: Boolean,
    organic: Boolean,
    biodynamic: Boolean,
    dogFriendly: Boolean,
    instagram: String,
    email: String,
    website: String,
    phone: String,
    rooms: Boolean,
    food: Boolean,
    reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("vineyards", VineyardSchema);
