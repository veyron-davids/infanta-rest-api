const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/addToCart", auth, async (req, res) => {

  try {
    const userInfo = await User.findById({ _id: req.user._id });
    const userData = await userInfo.addToCart(
      req.body.size,
      req.body.productID
    );
    return res.status(200).send(userData);
  } catch (err) {
    res.status(400).json("Please try again");
    console.log(err);
  }
});

router.post("/removeFromCart", auth, async (req, res) => {
  try {
    const userInfo = await User.findById({ _id: req.user._id });
    const userData = await userInfo.removeFromCart(
      req.body.size,
      req.body.productID
    );
    return res.status(200).send(userData);
  } catch (err) {
    res.status(400).json("Please try again");
    console.log(err);
  }
});

router.post("/removeItem", auth, async (req, res) => {
  try {
    const userInfo = await User.findById({ _id: req.user._id });
    const userData = await userInfo.removeItem(
      req.body.productID
    );
    return res.status(200).send(userData);
  } catch (err) {
    res.status(400).json("Please try again");
    console.log(err);
  }
});

router.get("/getCart", auth, (req, res) => {
  try {
    User.find({ _id: req.user._id })
      .select("-password")
      .populate("cart.items.productId")
      .exec((err, cart) => {
        return res.status(200).send(cart);
      });
  } catch (err) {
    res.status(400).json("Error fetching carts");
  }
});

router.post("/updateCart", auth, async (req, res) => {
  try {
    const userInfo = await User.findById({ _id: req.user._id });
    const userData = await userInfo.updateCart(req.body[1], req.body[0]);
    console.log(userData);
    User.findOne({ _id: req.user._id })
      .select("-password")
      .populate("cart.items.productId")
      .exec((err, cart) => {
        return res.status(200).send(cart);
      });
  } catch (err) {
    return res.status(400).json("Please try again");
  }
});

module.exports = router;
