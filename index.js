/** @format */
import authRoute from "./src/routes/authRoute.js";
import userRoute from "./src/routes/userRoute.js";
import mongoose from "mongoose";
import express from "express";
import dbConfig from "./db.config.js";
var bodyParser = require("body-parser");

const app = express();
app.use(express.json());
const PORT = 4000;
authRoute(app);
userRoute(app);
mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
  .then(() => console.log("Connected!"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.listen(PORT, () => console.log(`Your server is running on port ${PORT}`));
