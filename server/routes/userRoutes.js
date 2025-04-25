const express = require("express");
const router = express.Router();
const {
  getLeaderboard,
  searchUser,
  filterLeaderboard,
  recalculateRanks,
} = require("../controllers/userController");

router.get("/", getLeaderboard);

router.get("/search/:userId", searchUser);

router.get("/filter/:filter", filterLeaderboard);

router.post("/recalculate", recalculateRanks);

module.exports = router;
