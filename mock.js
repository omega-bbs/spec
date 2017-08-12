const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress } = require("apollo-server-express");
const {
  makeExecutableSchema,
  addMockFunctionsToSchema
} = require("graphql-tools");

const resolverFunctions = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date scalar type",
    /**
     * @param {String} value
     * @return {Date}
     */
    parseValue(value) {
      return new Date(value);
    },
    /**
     * @param {Date} value
     */
    serialize(value) {
      return value.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.String) {
        return ast.value;
      }
      return null;
    }
  })
};

const schemaString = fs.readFileSync("./schema.graphql").toString();
const schema = makeExecutableSchema({
  typeDefs: schemaString,
  resolvers: resolverFunctions
});
const mocks = {
  Date: () => new Date()
};
addMockFunctionsToSchema({
  schema,
  mocks
});
const app = express();

app.use(
  "/graphql",
  bodyParser.json(),
  graphqlExpress({
    schema
  })
);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Mock server listened on http://localhost:${port}/graphql`);
});
