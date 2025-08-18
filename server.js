const express = require("express");
const dbConnection = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");

const dotenv = require("dotenv");
const globalError = require("./middleware/errorMiddleware");
dotenv.config({ path: "config.env" });

// connect to database
dbConnection();

// create app instance
const app = express();

// enable cors on all incoming requests
app.use(cors());
app.options(/(.*)/, cors());

// parsing json from body
app.use(express.json({ limit: "20kb" }));

// log http requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount routes

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
