/** @format */

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./userModel");
db.role = require("./roleModel");
db.crawlerData = require("./crawlerModel");
db.crawlerWebsite = require("./crawlerWesitesMode");

db.ROLES = ["user", "admin"];

module.exports = db;
