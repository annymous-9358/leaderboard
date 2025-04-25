const User = require("../models/User");
const Activity = require("../models/Activity");
const moment = require("moment");
const mongoose = require("mongoose");

exports.getLeaderboard = async (req, res) => {
  try {
    const { filter, userId, simpleId } = req.query;
    let query = {};

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: [user],
      });
    } else if (simpleId) {
      const user = await User.findOne({ simpleId: parseInt(simpleId) });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        data: [user],
      });
    }

    const users = await User.find(query).sort({ totalPoints: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.searchUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let user;

    const simpleIdNum = parseInt(userId);
    if (!isNaN(simpleIdNum)) {
      user = await User.findOne({ simpleId: simpleIdNum });
    }

    if (!user && mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otherUsers = await User.find({ _id: { $ne: user._id } }).sort({
      totalPoints: -1,
    });

    const combinedResults = [user, ...otherUsers];

    return res.status(200).json({
      success: true,
      data: combinedResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.filterLeaderboard = async (req, res) => {
  try {
    const { filter } = req.params;

    let startDate;
    const now = moment();

    if (filter === "day") {
      startDate = now.startOf("day");
    } else if (filter === "month") {
      startDate = now.startOf("month");
    } else if (filter === "year") {
      startDate = now.startOf("year");
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter parameter. Use "day", "month", or "year".',
      });
    }

    const activities = await Activity.find({
      activityDate: { $gte: startDate.toDate() },
    }).populate("user");

    const allUsers = await User.find({});
    const userMap = {};
    allUsers.forEach((user) => {
      userMap[user._id.toString()] = {
        _id: user._id,
        fullName: user.fullName,
        simpleId: user.simpleId,
        totalPoints: 0,
        rank: 0,
      };
    });

    activities.forEach((activity) => {
      const userId = activity.user._id.toString();
      if (userMap[userId]) {
        userMap[userId].totalPoints += activity.points;
      }
    });

    let filteredUsers = Object.values(userMap)
      .filter((user) => user.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints);

    let currentRank = 1;
    let previousPoints = -1;

    filteredUsers = filteredUsers.map((user) => {
      if (previousPoints !== -1 && previousPoints !== user.totalPoints) {
        currentRank++;
      }
      user.rank = currentRank;
      previousPoints = user.totalPoints;
      return user;
    });

    return res.status(200).json({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.recalculateRanks = async (req, res) => {
  try {
    const users = await User.find({}).sort({ totalPoints: -1 });

    let currentRank = 1;
    let previousPoints = -1;

    for (const user of users) {
      if (previousPoints !== -1 && previousPoints !== user.totalPoints) {
        currentRank++;
      }

      user.rank = currentRank;
      await user.save();

      previousPoints = user.totalPoints;
    }

    const updatedUsers = await User.find({}).sort({ totalPoints: -1 });

    return res.status(200).json({
      success: true,
      message: "Ranks recalculated successfully",
      data: updatedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
