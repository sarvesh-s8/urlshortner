const tryCatchError = require("../middleware/tryCatchError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const UrlModel = require("../models/urlModel");
const { isURLValid, randomString } = require("../utils/helper");

function validateLongUrl(longUrl, next) {
  if (!longUrl) {
    return next(new ErrorHandler("Kindly provide a url to short", 400));
  }
  if (!isURLValid(longUrl)) {
    return next(new ErrorHandler("Invalid url Entered", 400));
  }
}

exports.quickCreate = tryCatchError(async (req, res, next) => {
  const { longUrl } = req.body;
  if (!longUrl) {
    return next(new ErrorHandler("Kindly provide a url to short", 400));
  }
  if (!isURLValid(longUrl)) {
    return next(new ErrorHandler("Not a valid url", 400));
  }
  // next(validateLongUrl(longUrl, next));
  const randomShorterUrl = randomString();
  let url = new UrlModel({
    longUrl,
  });

  await url.save();
  return res.status(201).json({
    success: "true",
    message: "Url shorted",
    shortUrl: randomShorterUrl,
  });
});

exports.createShortUrl = tryCatchError(async (req, res, next) => {
  console.log(req.userId, "REQ<<<<");
  const { longUrl } = req.body;
  if (!longUrl) {
    return next(new ErrorHandler("Kindly provide a url to short", 400));
  }
  if (!isURLValid(longUrl)) {
    return next(new ErrorHandler("Invalid url Entered", 400));
  }
  let url = await UrlModel.findOne({ longUrl, user: req.userId });
  const randomShorterUrl = randomString();
  if (url) {
    return next(
      new ErrorHandler(
        "You have already have a shortened version of this url!",
        400
      )
    );
  }
  url = await new UrlModel({
    longUrl,
    user: req.userId,
    shortUrl: randomShorterUrl,
  }).save();
  return res.status(201).json({
    success: "true",
    message: "Url shorted",
    url,
  });
});

exports.redirectToUrl = tryCatchError(async (req, res, next) => {
  console.log(req.params);
  let url = await UrlModel.findOneAndUpdate(
    {
      shortUrl: req.params.shortUrl,
    },
    { $inc: { click: 1 } },
    { new: true, runValidators: true }
  );

  if (!url) {
    return next(new ErrorHandler("URL not registered", 404));
  }
  res.status(200).json({
    success: true,
    message: "redirecting to url",
    longUrl: url.longUrl,
  });
});

exports.getDashboard = tryCatchError(async (req, res, next) => {
  let urls = await UrlModel.find({ user: req.userId }).sort({ _id: -1 });
  return res.status(200).json({
    success: true,
    message: "Dashboard data",
    urls,
  });
});

exports.getUrl = tryCatchError(async (req, res, next) => {
  let url = await UrlModel.findOne({
    longUrl: req.query.longUrl,
    user: req.user,
  });
  if (!url) {
    return next(new ErrorHandler("Url not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Url found",
    url,
  });
});

exports.deleteUrl = tryCatchError(async (req, res, next) => {
  const url = await UrlModel.findById(req.params.urlId);
  if (!url) {
    return next(new ErrorHandler("Url not found", 404));
  }
  await UrlModel.findByIdAndDelete(url);
  console.log("deleted");
  res.status(200).json({
    success: true,
    message: "Delete Successfully",
  });
});
