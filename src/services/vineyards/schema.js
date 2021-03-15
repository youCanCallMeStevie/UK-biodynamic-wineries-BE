const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { getAddressDetails } = require("../../utils/postionStack");

const VineyardSchema = new mongoose.Schema(
  {
    name: String,
    address: {
      type: Object,
      default: {},
    },
    fullAddress: String,
    details: Object,
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
          "Rose",
          "Sparkling",
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
    likes:[{ type: Schema.Types.ObjectId, ref: "users" }],
    reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  },
  { timestamps: true }
);


VineyardSchema.pre("findOneAndUpdate", async function preUpdate(next) {
 const toUpdate = this._update
  try {
    if (toUpdate.address) {
    toUpdate.fullAddress = `${toUpdate.address.addressLine1}, ${toUpdate.address.addressLine2}, ${toUpdate.address.locality}, ${toUpdate.address.region} ${toUpdate.address.postal_code} ${toUpdate.address.country}`;
      const addressDetails = await getAddressDetails(toUpdate.fullAddress);
      const details = addressDetails.data[0];
      this.update({details});
      next();
    } else next();
  } catch (err) {
    console.log(err);
   next(err)
  }
});
module.exports = mongoose.model("vineyards", VineyardSchema);
