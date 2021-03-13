const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/routes");
const vineyardRoutes = require("./vineyards/routes");
const userRoutes = require("./users/routes");

router.use("/auth", authRoutes);
router.use("/vineyards", vineyardRoutes)
router.use("/users", userRoutes);


module.exports = router;
