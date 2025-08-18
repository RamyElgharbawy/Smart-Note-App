const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

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

dotenv.config({ path: "config.env" });

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
