const express = require("express");
const {
  createListing,
  getSingleListing,
  deleteListing,
  getUserListings,
  getAllListings,
  updateListing,
  searchListings,
} = require("../controllers/listingController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.route("/createListing").post(isAuthenticated, createListing);
router.route("/getAllListings").get(getAllListings);
router.route("/getListing/:id").get(getSingleListing);
router.route("/delete/:id").delete(isAuthenticated, deleteListing);
router.route("/userListings").get(isAuthenticated, getUserListings);
router.route("/edit-listing/:id").put(isAuthenticated, updateListing);
router.route("/search").get(searchListings);

module.exports = router;
