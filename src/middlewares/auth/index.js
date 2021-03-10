const { error } = require("console");
const { verifyAccessToken } = require("../../Lib/auth/tokens");
const authRoutes = require("../../services/auth");

const authorizeUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    console.log(req.cookies);
    const user = await verifyAccessToken(accessToken);
    if (!user) throw error;
    else {
      req.user = user;
      next();
    }
  } catch (err) {
    const error = new Error("User not authenticated");
    error.code = 401;
    next(error);
  }
};

module.exports = authorizeUser;
