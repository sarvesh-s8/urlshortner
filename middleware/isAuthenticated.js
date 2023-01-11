const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");

const catchAsyncError = require("../middleware/tryCatchError");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(new ErrorHandler("Unauthorized Kindly Login", 400));
  }
  const { userId } = jwt.verify(
    req.headers.authorization,
    process.env.JWT_SECRET
  );
  req.userId = userId;
  next();

  // const { url_token } = req.cookies;
  // if (!url_token) {
  //   return next(new ErrorHandler("Kindly Login", 401));
  // }
  // const decode = jwt.verify(url_token, process.env.ACCESS_TOKEN);
  // req.user = await User.findById(decode.id);
  // next();
});
