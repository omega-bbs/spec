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

const Azogi = require("azogi");

const randomItem = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};

const azogi = new Azogi();

azogi.onExhausted = function(i) {
  this.push(
    [
      randomItem(
        "JavaScript EMCAScript CoffeeScript IcedScript TypeScript Flow ActionScript PHP".split(
          " "
        )
      ),
      randomItem("是 不是 可能是 大概是 应该是 一定是 可能不是 大概不是 应该不是 一定不是".split(" ")),
      randomItem("东半球 西半球 南半球 北半球 地球上 世界上 我会的 我知道的 我听说过的".split(" ")),
      randomItem("最好的 最差的 最先进的 最落后的 最垃圾的 最优雅的".split(" ")),
      randomItem("脚本语言 语言".split(" "))
    ].join("")
  );
};

const resolverFunctions = {
  // TODO: move it to a separated npm package
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
  ID: () => Math.floor(Math.random() * 1e6) + "",
  Date: () => new Date(Date.now() - Math.random() * 1e8),
  String: () => azogi.nextParagraph(300, 100)
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
