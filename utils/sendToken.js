const jwt = require("jsonwebtoken");

exports.sendToken = (res, statusCode, user, message = null) => {
  // CREATE JSON WEB TOKEN--
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  // COOKIE OPTIONS--
  const options = {
    httpOnly: true,
    expiresIn: process.env.COOKIE_EXPIRATION,
    secure: true,
    sameSite: "None",
  };
  // SEND RESPONSE TO THE USERS--
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
    message,
  });
};
