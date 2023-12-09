/** @format */

const jwt = require("jsonwebtoken");
const config = require("../../config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.findById(req.userId)
    .exec()
    .then((user) => {
      if (!user) {
        throw { status: 500, message: "User not found" };
      }

      return Role.find({ _id: { $in: user.roles } }).exec();
    })
    .then((roles) => {
      const isAdmin = roles.some((role) => role.name === "admin");

      if (isAdmin) {
        next();
      } else {
        throw { status: 403, message: "Require Admin Role!" };
      }
    })
    .catch((err) => {
      const status = err.status || 500;
      res.status(status).send({ message: err.message || "An error occurred." });
    });
};

const authJwt = {
  verifyToken,
  isAdmin,
};
module.exports = authJwt;
