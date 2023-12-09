/** @format */
const mongoose = require("mongoose");

const crawlerData = mongoose.model(
  "crawlerWebsite",
  new mongoose.Schema({
    url: { type: String, required: true },
    websiteName: { type: String, required: true },
    crawlingStatus: { type: Boolean, default: false },
  })
);
module.exports = crawlerData;
