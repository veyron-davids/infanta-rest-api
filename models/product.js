const mongoose = require("mongoose");

const productshema = new mongoose.Schema(
  {
    pname: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    numberInStock: {
      type: Number,
    },
    promotions: {
      type: Boolean,
    },
    size: {
       type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productshema);


exports.Product = Product;

