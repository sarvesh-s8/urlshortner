const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  // logout,
  getUserProfile,
  updatePassword,
  updateProfile,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/me").get(isAuthenticated, getUserProfile);

router.route("/password/forgot").post(forgotPassword);

router.route("/reset-password/:token").put(resetPassword);

// router.route("/logout").get(logout);

router.route("/password/update").put(isAuthenticated, updatePassword);
router.route("/me/update").put(isAuthenticated, updateProfile);

module.exports = router;
