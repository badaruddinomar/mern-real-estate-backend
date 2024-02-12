const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoutes");
const listingRoute = require("./routes/listingRoutes");
const bodyParser = require("body-parser");
const { frontendUrl } = require("./helper");
const app = express();

// MIDDLEWARES--
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // optionsSuccessStatus: 204,
  optionsSuccessStatus: 200,
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
// handling uncaught exceptions--
process.on("uncaughtException", (err) => {
  console.log(`error: ${err.message}`);
  console.log(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

// DATABASE CONNECTION--
mongoose
  .connect(process.env.DB)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(`Databse connection error ${err}`);
  });

// SERVER CONNECTION--
const server = app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
// ROUTES--
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/listing", listingRoute);

// ERROR HANDLING MIDDLEWARE--
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error!";
  return res.status(statusCode).json({
    success: false,
    message,
  });
});
// unhandled promise rejection--
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log(`Shuting down the server due to unhandled promise rejection!`);

  server.close(() => {
    process.exit(1);
  });
});
