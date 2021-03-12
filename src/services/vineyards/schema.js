const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new mongoose.Schema(
  {
    name: String,
    address: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, required: false },
      city: { type: String, required: false },
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
    rooms: String,
    food: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("vineyards", VineyardSchema);
