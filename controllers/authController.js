const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { errorHandler } = require("../utils/error");
const { sendToken } = require("../utils/sendToken");

// SIGN UP / REGISTER FUNCTIONALITY--

exports.signup = async (req, res, next) => {
  try {
    //  GET USER DATA--
    const { username, email, password } = req.body;
    // HASH THE PASSWORD FOR SECURITY PURPOSE--
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // CHECK USER DATA--
    if (username === "" || email === "" || password === "") {
      return res.status(400).json({ msg: "Please fill out all fields" });
    }
    // CREATE NEW USER--
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    // SEND RESPONSE--
    res.status(201).json({
      message: "Registered Successfuly",
      user: newUser,
      success: true,
    });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};

// LOGIN OR SIGN IN FUNCTIONALITY--
exports.signin = async (req, res, next) => {
  try {
    // GET USER DATA--
    const { email, password } = req.body;
    // FIND USER--
    const user = await User.findOne({ email });
    // CHECK USER EXISTS OR NOT--
    if (!user) {
      next(errorHandler(404, "user not found!"));
      return;
    }
    // VERIFY PASSWORD--
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      next(errorHandler(404, "Password is not correct!"));
      return;
    }
    // FILTER PASSWROD FROM USER DOC--
    const { password: pass, ...userDoc } = user._doc;

    // SEND RESPONSE--
    sendToken(res, 200, userDoc, "Successfuly Signed In");
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};

// GOOGLE AUTH FUNCTIONALITY--
exports.googleAuth = async (req, res, next) => {
  try {
    //GET USER DATA--
    const { username, email, avatar } = req.body;
    // CHECK USER EXISTS OR NOT--
    const user = await User.findOne({ email });
    if (user) {
      // FILTER PASSWROD FROM USER DOC--
      const { password: pass, ...userDoc } = user._doc;
      sendToken(res, 200, userDoc, "Successfuly Signed In");
    } else {
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      // HASH THE PASSWORD FOR SECURITY PURPOSE--
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(generatePassword, salt);
      // CREATE NEW USER--
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        avatar,
      });
      // FILTER THE PASSWORD--
      const { password: pass, ...userDoc } = newUser._doc;
      // SEND RENSPONE--
      sendToken(res, 201, userDoc, "Successfuly Signed In");
    }
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};

// SIGN OUT FUNCTIONALITY--
exports.signout = async (req, res, next) => {
  try {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "Successfuly Signed Out",
      });
  } catch (err) {
    next(errorHandler(500, "Something went wrong!"));
  }
};

// get user --
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(401, "User not authorized!"));
    res.status(200).json({
      message: "User Retrieved Successfuly",
      user,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: "something went wrong!" });
  }
};
