const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is mandatory"],
      maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email address',
      ]},
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
// });

// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compareSync(enteredPassword, this.password);
// };

// userSchema.methods.getJwtToken = function () {
//   return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN, {
//     expiresIn: "2d",
//   });
// };

// userSchema.methods.getResetPasswordToken = function () {
//   // Generate token
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   // Hash and set to resetPasswordToken
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   // Set token expire time
//   this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

//   return resetToken;
// };

module.exports = mongoose.model("User", userSchema);
