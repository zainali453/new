/** @format */
const mongoose = require("mongoose");

const crawlerData = mongoose.model(
  "crawlerData",
  new mongoose.Schema({
    scholarshipUrl: { type: String, required: true },
    source: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "crawlerWebsite",
      },
    ],
  })
);
module.exports = crawlerData;
