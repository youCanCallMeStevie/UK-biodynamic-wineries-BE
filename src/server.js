const express = require("express");
const listEndPoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const apiRoutes = require("./services");
const httpServer = http.createServer(server);

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
const PORT = process.env.PORT || 5000;

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
  // .then(() => {
  //     server.listen(PORT, () => {
  //       if (server.get("env") === "production")
  //       console.log("Server is running on CLOUD on PORT:", PORT);
  //       console.log("Server is running LOCALLY on PORT: http://localhost:", PORT);
  //     })
  //   .catch((err) => console.log(err));
  //   });
  .then(() =>
    server.listen(PORT, () => {
      console.log(`Our app is running on port ${PORT}`);
    })
  );

// httpServer.listen(PORT, () => {
//   console.log("server connected at port ", PORT);
// })
