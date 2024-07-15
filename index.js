const express = require("express");
const mongoose = require("mongoose");
const app = express();
const genericRoutes = require("./src/routes/genericRoutes");
const authRoutes = require("./src/routes/authRoutes");
const filterRoutes = require("./src/routes/filterRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api", genericRoutes);
app.use("/auth", authRoutes);
app.use("/filter", filterRoutes);

startServer();

async function startServer() {
  try {
    const port = process.env.PORT || 3001;
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}
