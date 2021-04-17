import fs from 'fs';
// import { ApolloServer } from 'apollo-server-express';
// const fs = require("fs");
const { ApolloServer } = require("apollo-server-express");
// const express = require("express");
import express from "express";
// const http = require("http");
import http from "http";
// const { log } = require("./log");
import { log } from "./log";
// const { initSpiker } = require("./spiker");
import { initSpiker } from "./spiker";

/////////////////////////////////////////

const [typeDefs, resolvers] = initSpiker();
log(resolvers);

/////////////////////////////////////////

const app = express();
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: false,
};

// Setup JWT authentication middleware
// app.use(async (req, res, next) => {
//   const token = req.headers["authorization"];
//   if (token !== "null") {
//     // try {
//     //   const currentUser = await jwt.verify(token, process.env.SECRET)
//     //   req.currentUser = currentUser
//     // } catch(e) {
//     //   console.error(e);
//     // }
//   }
//   next();
// });

log(`Starting Express / Apollo with cors...`);
const server = new ApolloServer({
  cors: corsOptions,
  typeDefs,
  resolvers,
  context: async () => { },
});
server.applyMiddleware({ app, cors: corsOptions });
const PORT = process.env.PORT || 4000;

// To serve up the playground in :4000/graphql
app.listen(PORT, () => {
  log(`🚀 Server ready at ${PORT}`);
});

/////////////////////////////////////////

// To serve up the test client in :4001/public
log(`Starting example frontend server...`);
http
  .createServer(function (req, res) {
    fs.readFile([__dirname, "/public", req.url].join(""), function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  })
  .listen(4001);
