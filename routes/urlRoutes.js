const express = require("express");
const {
  quickCreate,
  deleteUrl,
  getDashboard,
  getUrl,
  createShortUrl,
  redirectToUrl,
} = require("../controllers/urlController");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const router = express.Router();
router.route("/quick").post(quickCreate);

router.route("/create").post(isAuthenticated, createShortUrl);

router.route("/dashboard").get(isAuthenticated, getDashboard);
router.route("/search").get(isAuthenticated, getUrl);
router.route("/redirect/:shortUrl").put(isAuthenticated, redirectToUrl);

router.route("/delete/:urlId").delete(isAuthenticated, deleteUrl);

module.exports = router;

