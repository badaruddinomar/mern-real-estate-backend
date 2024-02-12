const { errorHandler } = require("../utils/error");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) next(errorHandler(401, "Please Sign In."));

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decodedData.id);
    req.user = user;
    next();
  } catch (err) {
    next(errorHandler(500, err.message));
  }
};
