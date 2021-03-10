const mongoose = require("mongoose")
const { Schema, model } = require("mongoose");
const ReviewSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
      },
      userId: 
        { type: String },
    
      vineyardId:{
        type: String,
        required: false,
      },
      likes: [{type:String}], 
    },
    {timestamps: true}
  );
const ReviewModel = model("reviews", ReviewSchema);
module.exports = ReviewModel;
