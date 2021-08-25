const express = require("express");
const auth = require("../routes/auth");
const products = require("../routes/product");
const users = require("../routes/users");
const carts = require("../routes/carts");
const orders = require("../routes/orders");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/products", products);
  app.use("/api/carts", carts);
  app.use("/api/orders", orders);
  app.use("/api/users", users);
  app.use("/public", express.static("public"));
};
