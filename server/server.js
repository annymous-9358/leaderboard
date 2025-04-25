const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
require("dotenv").config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
