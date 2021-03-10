const Joi = require("joi")
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
    _id: Joi.string(),
    text: Joi.string().required(1000),
    userId: Joi.string(),
    vineyardId: Joi.string(),
  })
}


module.exports = schemas
