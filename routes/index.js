const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const graphqlMiddleware = require("../middlewares/graphqlMiddleware");
const { protect } = require("../services/authService");

const mountRoutes = (app) => {
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/graphql", protect, graphqlMiddleware);
};
module.exports = mountRoutes;
