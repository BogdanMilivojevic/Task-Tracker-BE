const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    unique: true,
    type: String,
    required: [true, "A user must have a username"],
  },
  email: {
    unique: true,
    type: String,
    required: [true, "A user must have a email"],
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    unique: true,
    minlength: [6, "A password must have at least 6 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "A password must be confirmed"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords dont match",
    },
    select: false,
  },
  tasks: [],
});

//Password encryption
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

//Checking if login password is same as DB password
userSchema.methods.checkPassword = async function (loginPassword, dbPassword) {
  return await bcrypt.compare(loginPassword, dbPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
