const { graphqlHTTP } = require("express-graphql");
const root = require("../graphql/resolvers");
const schema = require("../graphql/schema");

// GraphQL middleware
const graphqlMiddleware = graphqlHTTP((req, res) => ({
  schema: schema,
  rootValue: root,
  context: { req, res },
  graphiql: process.env.NODE_ENV === "development",
}));

module.exports = graphqlMiddleware;
