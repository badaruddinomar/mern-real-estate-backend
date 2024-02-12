const Listing = require("../models/listingModel");
const { errorHandler } = require("../utils/error");
const cloudinary = require("../utils/cloudinary");
exports.createListing = async (req, res, next) => {
  try {
    let images = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
    const imagesLink = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "listing",
      });
      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imagesLink;
    req.body.user = req.user.id;

    const listing = await Listing.create(req.body);
    res.status(201).json({
      message: "Listing Created Successfuly",
      listing,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};
// get single listing--
exports.getSingleListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("user", {
      email: 1,
    });
    res.status(200).json({
      message: "Listing Retrieved Successfuly",
      listing,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};
// Get listing for owner--
exports.getUserListings = async (req, res, next) => {
  try {
    const listing = await Listing.find({ user: req.user.id });
    res.status(200).json({
      message: "Listing Retrieved Successfuly",
      listing,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};

// get all listings--
exports.getAllListings = async (req, res, next) => {
  try {
    const listing = await Listing.find().sort({ ["createdAt"]: -1 });
    res.status(200).json({
      message: "Listing Retrieved Successfuly",
      listing,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};
// delete listing--
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    listing.images.map(async (image) => {
      return await cloudinary.uploader.destroy(image.public_id);
    });
    res.status(200).json({
      message: "Listing Deleted Successfuly",
      listing,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};
// update listing--
exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    // check the real listng owner--

    if (req.user.id !== listing.user.toString())
      return next(errorHandler(404, "Your are not allowed to update!"));

    if (typeof req.body.images[0] === "string") {
      // delete previous images--
      await Promise.all(
        listing?.images?.map(async (image) => {
          return await cloudinary.uploader.destroy(image.public_id);
        })
      );
      // upload updated images--
      let imagesLink = [];
      const imagesArray = await Promise.all(
        req.body.images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image, {
            folder: "listing",
          });
          imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
          return imagesLink;
        })
      );
      req.body.images = imagesLink;
    } else {
      req.body.images = listing.images;
    }
    const newListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: true,
      }
    );
    res.status(200).json({
      message: "Listing Updated Successfuly",
      listing: newListing,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};

// search api endpoint--
exports.searchListings = async (req, res, next) => {
  try {
    const totalListings = await Listing.countDocuments();
    const limit = parseInt(req.query.limit) || 6;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === "undefined" || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === "undefined" || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === "undefined" || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === "undefined" || type === "all") {
      type = { $in: ["sell", "rent"] };
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";

    const order = Number(req.query.order) || -1;

    const filteredResults = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    });

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);
    res.status(200).json({
      results: listings.length,
      message: "Listing Retrieved Successfuly",
      listings,
      success: true,
      totalListings,
      filteredResults: filteredResults.length,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};
