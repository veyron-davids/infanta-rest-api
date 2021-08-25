const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/getOpenOrders", auth, async (req, res) => {
  try {
    User.find({ _id: req.user._id })
      .select("-password")
      .populate("orders.open.products.productId")
      .exec((err, orders) => {
        return res.status(200).send(orders);
      });
  } catch (err) {
    res.status(400).json("Error fetching Orders");
  }
});

router.get("/getClosedOrders", auth, async (req, res) => {
  try {
    User.find({ _id: req.user._id })
      .select("-password")
      .populate("orders.closed.products.productId")
      .exec((err, orders) => {
        return res.status(200).send(orders);
      });
  } catch (err) {
    res.status(400).json("Error fetching Orders");
  }
});

router.post("/addOrders", auth, async (req, res) => {
  console.log(req.body);
  try {
    const userInfo = await User.findById({ _id: req.user._id });
    const userData = await userInfo.Addorder(req.body);
    return res.status(200).send(userData);
  } catch (err) {
    res.status(400).json("Please try again");
    console.log(err);
  }
});

module.exports = router;
