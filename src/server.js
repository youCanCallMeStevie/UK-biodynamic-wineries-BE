const express = require("express");
const listEndPoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const apiRoutes = require("./services");

const cookieParser = require("cookie-parser");
const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./middlewares/errorHandling");

require("./utils/auth/strategies/google");
const { PORT, FE_URL, FE_URL_PROD, MONGO_CONNECTION } = process.env;

//Initial Set-up
const server = express();
PORT || 5000;

//Middlewares
server.use(express.json());
server.use(passport.initialize());
const whiteList = [FE_URL, FE_URL_PROD, "http://localhost:3000"];
server.use(
  cors({ origin: whiteList, credentials: true, exposedHeaders: ["set-cookie"] })
); //if using cookies, you can't leave cors empty
server.use(cookieParser());

//ROUTES
server.use("/api", apiRoutes);

//ERROR HANDLERS
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);
// console.log(listEndPoints(server));

mongoose
  .connect(MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    httpServer.listen(PORT, () => {
      console.log("server connected at port ", PORT);
    })
  );
