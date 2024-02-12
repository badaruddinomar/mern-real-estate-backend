const express = require("express");
const {
  signup,
  signin,
  googleAuth,
  signout,
  getUser,
} = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/googleAuth").post(googleAuth);
router.route("/signout").get(signout);
router.route("/user").get(isAuthenticated, getUser);

module.exports = router;
