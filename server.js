const path = require("path");
const express = require("express");
const dbConnection = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const { xss } = require("express-xss-sanitizer");
const compression = require("compression");
const hpp = require("hpp");
const globalError = require("./middlewares/errorMiddleware");
const mountRoutes = require("./routes");

const dotenv = require("dotenv");
const ApiError = require("./utils/ApiError");
dotenv.config({ path: "config.env" });

// connect to database
dbConnection();

// create app instance
const app = express();

// enable cors on all incoming requests
app.use(cors());
app.options(/(.*)/, cors());

// compress all responses
app.use(compression());

// parsing json from body
app.use(express.json({ limit: "4mb" }));
app.use(express.static(path.join(__dirname, "uploads")));

// log http requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Middleware for sanitize inputs data
app.use(xss());

// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too Many Requests please try again after 15 min",
});
app.use("/api/v1/auth", limiter);
app.use("/api/v1/user", limiter);

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: ["note"],
  })
);

// Mount Routs
mountRoutes(app);

// handle unknown routes
app.all(/(.*)/, (req, res, next) => {
  new ApiError(`Can't Find this Route: ${req.originalUrl}`, 404);
});

// Global Error Handling Middleware inside Express
app.use(globalError);

// Create server
const Port = process.env.PORT || 8000;
const server = app.listen(Port, () => {
  console.log(`App Running on port ${Port}`);
});

// @desc  handle rejections error outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting Down.....");
    process.exit(1);
  });
});
