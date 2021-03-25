const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    imageUrl: {type: String, default:"https://res.cloudinary.com/youcancallmestevie/image/upload/v1616713353/BDusers/moon_avatar_xsg1jn.jpg"},
  
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
    // toJSON: {
    //   virtuals: true,
    //   transform: function (doc, ret) {
    //     delete ret.id;
    //     delete ret.password;
    //     delete ret.createdAt;
    //     delete ret.updatedAt;
    //     delete ret.googleId;
    //     return ret;
    //   },
    // },

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


UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject._v;

  return userObject;
};

// UserSchema.statics.findByCredentials = async function (email, plainPW) {
//   const user = await this.findOne({ email });
//   console.log("findByCredentials user", user);

//   if (user) {
//     const match = await bcrypt.compare(plainPW, user.password);
//     if (match) return user;
//   } else {
//     return null;
//   }
// };

// UserSchema.pre("save", async function (next) {
//   const user = this;
//   const plainPW = user.password;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(plainPW, 10);
//   }
//   next();
// });


const UserModel = model("users", UserSchema);
module.exports = UserModel;