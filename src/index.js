const fs = require("fs");
// const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const http = require("http");
const pluralize = require("pluralize");
const typeDefs = fs.readFileSync(
  `./repository/${process.env.REPO}/schema.graphql`,
  "utf8"
);
const { getValues, readCachedTable, FILE_CACHE } = require("./repository");
const { toTypeName } = require("./manipulation");
const { log } = require("./log");
const { Source, parse } = require("graphql"); // CommonJS

const s = new Source(typeDefs);
const d = parse(s);
d.definitions.forEach((def) => {
  console.log("==>", def.kind, "::", def.name);

  if (def.kind == "ObjectTypeDefinition") {
    if (def.fields) {
      def.fields.forEach((f) => {
        console.log("\t==>", f.kind, "::", f.name);
        if (f.directives.length) {
          console.log(
            "\t\t",
            f.directives[0],
            f.directives[0].arguments[0].name,
            " = ",
            f.directives[0].arguments[0].value
          );
        }
      });
    }
  }
});

// Try to find user defined queries in the graphql file
// this is *super* error prone.
const extraQueries = [...typeDefs.match(/\S([_\-a-zA-Z0-9]+)\(/gi)];

log(`Scanning repository ${process.env.REPO}...`);
const files = fs.readdirSync(`./repository/${process.env.REPO}`);

// remove file extensions
const tables = files.map((t) => {
  const nameExt = t.split(".");
  // skip the schema
  if (nameExt[1] === "graphql") {
    return undefined;
  }
  return nameExt[0];
});

// Using the table names, create generic resolvers
// that use the name and name with a "plural"
// Mutation: {
//   // createResponse: async (_, { response }, ctx) => {
//   //   const res = await addRow(ctx, 'traits', response);
//   //   return res;
//   // },
// },
function makeResolvers(tables, extraQueries) {
  // const rtn = { Query: {}, Mutation: {} }
  const rtn = { Query: {} };

  log(`Reading all tables into memory...`);
  tables.forEach((t) => {
    if (t !== undefined) readCachedTable(t);
  });

  log(`Creating resolvers for tables...`);
  tables.forEach((t) => {
    if (t !== undefined) {
      rtn.Query[toTypeName(t)] = async (parent, args, ctx) => {
        return await getValues(parent, ctx, t, args);
      };
      rtn.Query[pluralize(toTypeName(t), 2)] = async (parent, args, ctx) => {
        return await getValues(parent, ctx, t, args);
      };

      extraQueries.forEach((query) => {
        const gqlName = query.slice(0, -1);
        if (!gqlName.startsWith("@")) {
          rtn.Query[gqlName] = async (parent, args, ctx) => {
            return await getValues(parent, ctx, t, args);
          };
        } else {
          console.log(gqlName, query);
        }
      });

      // Look at the CSV fields, and if there is an xxxxx_id, try to
      // make a relation to that object
      const fields = FILE_CACHE[t].meta.fields;
      rtn[t] = {};
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].endsWith("_id")) {
          // const relation = fileNameToTypeName(fields[i].split("_id")[0]);
          const relation = toTypeName(fields[i].split("_id")[0]);
          log(`${t} assumed relation:`, relation);
          const objRelation =
            relation.charAt(0).toUpperCase() + relation.slice(1);
          rtn[t][relation] = async (parent, args, ctx) => {
            return await getValues(parent, ctx, objRelation, args);
          };
        }
      }
    }
  });
  return rtn;
}

const resolvers = makeResolvers(tables, extraQueries);
log(resolvers);
/////////////////////////////////////////////////

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
  context: async () => {},
});
server.applyMiddleware({ app, cors: corsOptions });
const PORT = process.env.PORT || 4000;

// To serve up the playground in :4000/graphql
app.listen(PORT, () => {
  log(`🚀 Server ready at ${PORT}`);
});

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
