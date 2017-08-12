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
      randomItem("我 你 楼下 楼上 楼主 沙发 板凳 隔壁".split(" ")),
      randomItem("妈 爸 室友 家长 同学 老师".split(" ")),
      randomItem("今天 昨天 前天 上次 去年 以前 一直".split(" ")),
      randomItem("认识一个 是一个 特么是 就是一个".split(" ")),
      randomItem("奇葩 好人 傻逼".split(" "))
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
