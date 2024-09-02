const { error, log } = require("console");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/.env" });

mongoose
  .connect(process.env.MONGO_DB, {})
  .then(() => log("MongoDB connected successfully")) // Utilisez 'log' ici
  .catch((err) => error("Error connecting to MongoDB:", err)); // Utilisez 'error' ici
