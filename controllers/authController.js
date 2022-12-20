const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsyncErr = require("../utils/catchAsyncError");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const SendMail = require("../utils/email");

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}`,
  });
  res.status(statusCode).json({
    status: "success",
    token,
  });
};

exports.register = catchAsyncErr(async (req, res, next) => {
  const subjectText = `Welcome to Task Tracker family`;
  const emailBody = `Task Tracker is a cutting edge web-app for keeping track of your plans, we are glad to have you with use `;
  const user = await User.create({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  await SendMail({
    email: req.body.email,
    subject: subjectText,
    text: emailBody,
  });
  sendToken(user, 201, res);
});

exports.login = catchAsyncErr(async (req, res, next) => {
  const email = req.body.email;
  const loginPassword = req.body.password;

  if (!email || !loginPassword)
    return next(new AppError("No email or password provided", 401));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(loginPassword, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  sendToken(user, 200, res);
});

exports.getUser = catchAsyncErr(async (req, res, next) => {
  token = req.body.token;

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError("No user found", 401));

  res.status(200).json({
    user,
  });
});

exports.createTask = catchAsyncErr(async (req, res, next) => {
  const task = req.body.task;
  const token = req.body.token;

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  await user.updateOne({
    $push: { tasks: task },
  });

  res.status(200).json({
    status: "success",
  });
});

exports.deleteTask = catchAsyncErr(async (req, res, next) => {
  const { textDB, token } = req.body;

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  await user.updateOne({
    $pull: { tasks: { text: textDB } },
    safe: true,
    multi: true,
  });

  res.status(200).json({
    status: "success",
  });
});
