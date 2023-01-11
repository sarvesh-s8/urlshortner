const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  console.log("err", err);
  err.statusCode = err.statusCode || 500;
  let error = { ...err };
  error.message = err.message;
  if (err.name === "CastError") {
    const message = `Id is incorrect for path ${err.path}`;
    error = new ErrorHandler(message, 404);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorHandler(message, 400);
  }

  // Handling Mongoose duplicate key errors
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    error = new ErrorHandler(message, 400);
  }

  // Handling wrong JWT error
  console.log(err.name, "err.name");
  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid. Try Again!!!";
    error = new ErrorHandler(message, 400);
  }

  // Handling Expired JWT error
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token is expired. Try Again!!!";
    error = new ErrorHandler(message, 400);
  }
  console.log(error);
  res.status(error.statusCode).json({
    success: false,
    error,
    stack: error.stack,
    message: error.message,
  });
};
