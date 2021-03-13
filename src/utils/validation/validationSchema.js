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
    vineyardId: Joi.string(),
  }),
  vineyardSchema: Joi.object().keys({
    name: Joi.string().required(100),
    address: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string(),
        city: Joi.string().required(),
        postcode: Joi.string().required(),
      })
      .required(),
    description: Joi.string(),
    bio: Joi.string(),
    region: Joi.string(),
    images: Joi.string(),
    grapes: Joi.array().items(Joi.string()),
    styles: Joi.array().items(Joi.string()),
    guidedTours: Joi.boolean().required(),
    guidedTastings: Joi.boolean().required(),
    organic: Joi.boolean().required(),
    biodynamic: Joi.boolean().required(),
    dogFriendly: Joi.boolean().required(),
    instagram: Joi.string(),
    email: Joi.string(),
    website: Joi.string(),
    rooms: Joi.boolean().required(),
    food: Joi.boolean(),
  }),
};

module.exports = schemas;
