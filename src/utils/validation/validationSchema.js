const Joi = require("joi");

const schemas = {
  userSchema: Joi.object().keys({
    name: Joi.string(),
    lastname: Joi.string(),
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    bio: Joi.string(),
  }),
  loginSchema: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),
  reviewSchema: Joi.object().keys({
    text: Joi.string().required(1000),
    userId: Joi.string(),
    rating: Joi.number().min(1).max(5).integer(),
  }),
  vineyardSchema: Joi.object().keys({
    name: Joi.string().required(100),
    address: Joi.object(),
    description: Joi.string(),
    bio: Joi.string(),
    region: Joi.string(),
    images: Joi.string(),
    grapes: Joi.array().items(Joi.string()),
    styles: Joi.array().items(Joi.string()),
    guidedTours: Joi.boolean(),
    guidedTastings: Joi.boolean(),
    organic: Joi.boolean(),
    biodynamic: Joi.boolean(),
    dogFriendly: Joi.boolean(),
    instagram: Joi.string(),
    email: Joi.string(),
    website: Joi.string(),
    rooms: Joi.boolean(),
    food: Joi.boolean(),
  }),
};

module.exports = schemas;
