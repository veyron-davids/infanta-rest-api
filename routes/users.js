const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const express = require("express");
const router = express.Router();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: "",
    },
  })
);

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("FirstName")
      .trim()
      .not()
      .isEmpty()
      .withMessage("This field is required"),
    body("LastName")
      .trim()
      .not()
      .isEmpty()
      .withMessage("This field is required"),
    body("address")
      .trim()
      .not()
      .isEmpty()
      .withMessage("This field is required"),
    body("phoneNumber")
      .trim()
      .not()
      .isEmpty()
      .isNumeric()
      .withMessage("This field is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
        res.send(errors);
      }
      let user = new User(
        _.pick(req.body, [
          "FirstName",
          "LastName",
          "email",
          "phoneNumber",
          "address",
          "password",
        ])
      );
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();

      const token = user.generateAuthToken();
      res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .send(
          _.pick(user, ["_id", "FirstName", "LastName", "email", "phoneNumber"])
        );
      // transporter.sendMail({
      //   to: email,
      //   from: "shopper-io@gmail.com",
      //   subject: "Signup succeeded!",
      //   html: "<h1>You successfully signed up..testing</h1>",
      // });
    } catch (err) {}
  }
);

module.exports = router;