
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    trim: true,
  },
  LastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
  },
  address: {
    type: String,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: { type: Number },
      },
    ],
  },
  recentlyviewed: {
    type: Array,
    default: [],
  },
  liked: {
    type: Array,
    default: [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      FirstName: this.FirstName,
      LastName: this.LastName,
      email: this.email,
      cart: this.cart,
      isAdmin: this.isAdmin,
    },
    `${process.env.JWT_PRIVATE_KEY}`,
   // { expiresIn: "5s" }
  );
  return token;
};

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = Number(newQuantity);
  } else {
    updatedCartItems.push({
      productId: product,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  this.save();
  return this;
};

userSchema.methods.updateCart = function (updatedQty, product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp._id.toString() === product.toString();
  });
  const updatedCartItems = [...this.cart.items];
  updatedCartItems[cartProductIndex].quantity = Number(updatedQty);
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  this.save();
  return this;
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
