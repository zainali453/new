/** @format */

const config = require("../../config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user
    .save()
    .then(() => {
      if (req.body.roles) {
        return Role.find({ name: { $in: req.body.roles } });
      } else {
        return Role.findOne({ name: "user" });
      }
    })
    .then((roles) => {
      if (roles) {
        user.roles = Array.isArray(roles)
          ? roles.map((role) => role._id)
          : [roles._id];
        return user.save();
      }
    })
    .then(() => {
      res.send({ message: "User was registered successfully!" });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: err.message || "An error occurred during signup." });
    });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email })
    .populate("roles", "-__v")
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });

      const authorities = user.roles.map(
        (role) => "ROLE_" + role.name.toUpperCase()
      );

      res.status(200).send({
        id: user._id,
        email: user.email,
        roles: authorities,
        accessToken: token,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: err.message || "An error occurred during signin." });
    });
};
