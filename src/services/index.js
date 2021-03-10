const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const vineyardRoutes = require("./vineyards");
const userRoutes = require("./users");

router.use("/auth", authRoutes);
router.use("/vineyards", vineyardRoutes)
router.use("/users", userRoutes);


module.exports = router;
