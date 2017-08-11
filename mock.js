const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress } = require('apollo-server-express')
const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools')

const schemaString = fs.readFileSync('./schema.graphql').toString()
const schema = makeExecutableSchema({ typeDefs: schemaString })
addMockFunctionsToSchema({ schema })

const app = express()

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

app.listen(process.env.PORT || 8000)
