const sendError = (err, res) => {
  console.log(err);
  if (err.code === 11000) {
    res.status(400).json({
      status: "fail",
      message: `The ${Object.keys(err.keyValue)}: ${Object.values(
        err.keyValue
      )} is already in use, please use another one`,
    });
  } else if (err._message === "User validation failed") {
    res.status(400).json({
      status: "fail",
      message: err.message.split(":")[2],
    });
  } else if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  sendError(err, res);
};
