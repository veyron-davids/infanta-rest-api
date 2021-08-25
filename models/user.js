const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// var autoIncrement = require("mongoose-auto-increment");

// autoIncrement.initialize(mongoose.connection);

var userSchema = new mongoose.Schema({
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
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        size: {
          small: { type: Number },
          medium: { type: Number },
          large: { type: Number },
          xlarge: { type: Number },
          xxlarge: { type: Number },
        },
        total: { type: Number },
        // color: { type: String },
      },
    ],
  },
  orders: {
    open: [
      {
        orderId: { type: String },
        products: [
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
            },
            size: { type: Object, default: {} },
          },
        ],
        total: { type: Number },
      },
    ],
    closed: [
      {
        orderId: { type: String },
        products: [
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
            },
            size: { type: Object, default: {} },
          },
        ],
        total: { type: Number },
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
  address: [
    {
      addressName: { type: String, default: "" },
      additional: { type: String, default: "" },
      state: { type: String, default: "" },
      city: { type: String, default: "" },
      default: { type: Boolean, default: false },
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      FirstName: this.FirstName,
      LastName: this.LastName,
      email: this.email,
      cart: this.cart,
      delivery: this.delivery,
      isAdmin: this.isAdmin,
    },
    `${process.env.JWT_PRIVATE_KEY}`
    // { expiresIn: "5s" }
  );
  return token;
};

userSchema.methods.addToCart = function (spec, id) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() == id.toString();
  });
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].size[spec] =
      updatedCartItems[cartProductIndex].size[spec] + 1;
    updatedCartItems[cartProductIndex].total =
      updatedCartItems[cartProductIndex].total + 1;
  } else {
    let newSize = {
      small: 0,
      medium: 0,
      large: 0,
      xlarge: 0,
      xxlarge: 0,
    };
    newSize[spec] = 1;
    updatedCartItems.push({
      productId: id,
      size: newSize,
      total: 1,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  const response = updatedCart.items;
  this.cart = updatedCart;
  this.save();
  return { spec, id, response };
};

userSchema.methods.removeFromCart = function (spec, id) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() == id.toString();
  });
  let updatedCartItems = [...this.cart.items];
  if (
    cartProductIndex >= 0 &&
    updatedCartItems[cartProductIndex].size[spec] > 1
  ) {
    updatedCartItems[cartProductIndex].size[spec] =
      updatedCartItems[cartProductIndex].size[spec] - 1;
    updatedCartItems[cartProductIndex].total =
      updatedCartItems[cartProductIndex].total - 1;
  } else if (
    cartProductIndex >= 0 &&
    updatedCartItems[cartProductIndex].total !== 1 &&
    updatedCartItems[cartProductIndex].size[spec] == 1
  ) {
    updatedCartItems[cartProductIndex].size[spec] =
      updatedCartItems[cartProductIndex].size[spec] - 1;
    updatedCartItems[cartProductIndex].total =
      updatedCartItems[cartProductIndex].total - 1;
  } else if (
    cartProductIndex >= 0 &&
    updatedCartItems[cartProductIndex].total === 1
  ) {
    for (let i = 0; i <= updatedCartItems.length; i++) {
      if (updatedCartItems[i].productId.toString() == id.toString())
        updatedCartItems.splice(i, 1);
    }
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  const response = updatedCart.items;
  this.cart = updatedCart;
  this.save();
  return { spec, id, response };
};

userSchema.methods.removeItem = function (id) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() == id.toString();
  });
  const updatedCartItems = [...this.cart.items];
  updatedCartItems.splice(cartProductIndex, 1);
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

userSchema.methods.UpdateAddress = function (data) {
  const updatedAddress = {
    addressName: data["addressName"],
    additional: data["additional"],
    state: data["state"],
    city: data["city"],
  };
  this.address = updatedAddress;
  // this.phoneNumber = data["phoneNumber"];
  // this.email = data["email"];
  this.save();
  return this.address;
};

userSchema.methods.CreateAddress = function (data) {
  const updatedAddress = [...this.address];
  updatedAddress.unshift(data);
  this.address = updatedAddress;
  this.save();
  return this.address;
};

userSchema.methods.SetDefaultAddress = function (data) {
  const updatedAddress = this.address;
  updatedAddress.map((item) => {
    if (item._id.toString() === data.toString()) {
      item.default = true;
    } else {
      item.default = false;
    }
  });
  this.address = updatedAddress;
  this.save();
  return this.address;
};

userSchema.methods.Addorder = function (data) {
  const updatedOrders = [...this.orders.open];
  updatedOrders.push({
    orderId: Date.now().toString(),
    products: data.products,
    total: data.total,
  });
  this.cart.items = [];
  this.orders.open = updatedOrders;
  this.save();
  return this.orders;
};

// userSchema.plugin(autoIncrement.plugin, "User");
const User = mongoose.model("User", userSchema);
module.exports = { User };
