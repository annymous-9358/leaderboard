const express = require("express");
const router = express.Router();
const {
  createActivity,
  getAllActivities,
  getUserActivities,
} = require("../controllers/activityController");

router.post("/", createActivity);

router.get("/", getAllActivities);

router.get("/user/:userId", getUserActivities);

module.exports = router;
