const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const ReviewSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    rating: Number,
    userId: {  type: mongoose.Schema.Types.ObjectId, ref: "users" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);
const ReviewModel = model("reviews", ReviewSchema);
module.exports = ReviewModel;
