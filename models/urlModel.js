const mongoose = require("mongoose");

const UrlModel = new mongoose.Schema({
  longUrl: {
    type: String,
    required: [true, "Kindly enter the required url"],
  },
  shortUrl: {
    type: String,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  click: {
    type: Number,
    default: 0,
  },
});
UrlModel.pre("save", function (next) {
  if (this.isNew) {
    this.shortUrl = this.shortUrl;
  }
  return next();
});

module.exports = mongoose.model("urlModel", UrlModel);
