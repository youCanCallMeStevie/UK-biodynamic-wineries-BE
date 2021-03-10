const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    imageUrl: String,
  
    email: {
      type: String,
      required: true,
    },
    bio: {
      type: String
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    publicProfile:{
      type: Boolean,
      default: true
    },
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    reviewsGiven:[{type: mongoose.Schema.Types.ObjectId, ref: "reviews"}],
    likedReviews:[{type: mongoose.Schema.Types.ObjectId, ref: "reviews"}],
    likedVineyards:[{type: mongoose.Schema.Types.ObjectId, ref: "vineyards"}],
    vistedVineyards:[{type: mongoose.Schema.Types.ObjectId, ref: "vineyards"}],



    refreshToken: String,
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.id;
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.googleId;
        return ret;
      },
    },

    timestamps: true,
  }
);

UserSchema.methods.comparePass = async function (pass) {
  try {
    const isValid = await bcrypt.compare(pass, this.password);
    return isValid;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = mongoose.model("users", UserSchema);
