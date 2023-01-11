const jwt = require("jsonwebtoken");
const path = require("path");
const tryCatchError = require("../middleware/tryCatchError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const readHTML = require("../utils/readHtml");
const handlebars = require("handlebars");
const bcrypt = require("bcrypt");

exports.getUserProfile = tryCatchError(async (req, res, next) => {
  // console.log(req.userId);

  // console.log( req.userId);
  const user = await User.findById(req.userId);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.registerUser = tryCatchError(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return next(new ErrorHandler("Enter all the mandatory fields", 400));
  }
  if (password.length < 6) {
    return next(new ErrorHandler("Password lenght cannot be less than 6"));
  }
  const findEmail = await User.findOne({ email });
  if (findEmail) {
    return next(new ErrorHandler("User already exists", 400));
  }
  let user = new User({
    name,
    email,
    password,
  });

  user.password = await bcrypt.hash(password, 10);

  await user.save();

  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, (err, token) => {
    if (err) {
      return next(new ErrorHandler("Registration went wrong", 404));
    }
    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user,
    });
  });
  await sendEmail({
    to: user.email,
    subject: "Welcome To Url Shorty",
    html: `<h1>Hello ${user.name}</h1>
    <div>
    We are Happy to get you on board
    </div>`,
  });
});

exports.loginUser = tryCatchError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Enter all the mandatory fields", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("User has not been registered", 400));
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, (err, token) => {
    if (err) throw err;
    res.status(200).json({
      success: true,
      message: "Login Successfull",
      user,
      token,
    });
  });
  // sendToken(user, 200, res);
});

exports.forgotPassword = tryCatchError(async (req, res, next) => {
  const { email } = req.body;
  console.log(email, "EMAIL");
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User is not registered", 400));
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const htmlTemplate = await readHTML(
    path.join(__dirname, "..", "emails", "forgot-password.html")
  );
  const handlebarTemplate = handlebars.compile(htmlTemplate);
  const replace = { resetUrl };
  const html = handlebarTemplate(replace);
  console.log(user.email, "======");
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      html,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }
  await user.save();
  return res.status(200).json({ msg: "Email Sent" });
});

exports.resetPassword = tryCatchError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(req.params.token);
  // console.log("resetPasswordToken", resetPasswordToken);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }
  if (!req.body.password) {
    return next(new ErrorHandler("Enter all the required Fields", 404));
  }
  if (req.body.password.length < 6) {
    return next(
      new ErrorHandler("Password needs to be of atleast 6 characters")
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password do not match", 400));
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return res.status(200).json({ msg: "Password reset complete" });
});

exports.updatePassword = tryCatchError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const matchPassword = await bcrypt.compare(currentPassword, user.password);

  if (!matchPassword) {
    return next(new ErrorHandler("Password is Incorrect", 401));
  }

  if (newPassword.length < 6) {
    return next(new ErrorHandler("Lenght should be greater than 6", 400));
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Password Changed Successfully" });
  // sendToken(user, 200, res);
});

exports.updateProfile = tryCatchError(async (req, res, next) => {
  const { name, email } = req.body;
  // if (!name || !email) {
  //   return next(new ErrorHandler("Atleast enter any field", 400));
  // }
  const userDataNew = {
    name,
    email,
  };

  // console.log(req.userId);
  const user = await User.findByIdAndUpdate(req.userId, userDataNew, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    user,
  });
});

// exports.registerUser = tryCatchError(async (req, res, next) => {
//   const { name, email, password } = req.body;
//   if (!email || !password || !name) {
//     return next(new ErrorHandler("Enter all the mandatory fields", 400));
//   }
//   const findEmail = await User.findOne({ email });
//   if (findEmail) {
//     return next(new ErrorHandler("User already exists", 400));
//   }
//   const user = await User.create({
//     name,
//     email,
//     password,
//   });

//   sendToken(user, 200, res);
// });

// exports.loginUser = tryCatchError(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return next(new ErrorHandler("Enter all the mandatory fields", 400));
//   }

//   const user = await User.findOne({ email }).select("+password");
//   if (!user) {
//     return next(new ErrorHandler("User has not been registered", 400));
//   }
//   const isMatchedPassword = await user.comparePassword(password);
//   if (!isMatchedPassword) {
//     return next(new ErrorHandler("Invalid Credentials", 400));
//   }
//   sendToken(user, 200, res);
// });

// exports.logout = tryCatchError(async (req, res, next) => {
//   // const users = await User.find();
//   res.cookie("url_token", null, {
//     expires: new Date(Date.now()),
//     httpOnly: true,
//   });

//   res.status(200).json({
//     success: true,
//     message: "User logged out successfully",
//   });
// });
