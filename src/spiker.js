const fs = require("fs");
const { getValues, readCachedTable, FILE_CACHE } = require("./repository");
const { toTypeName } = require("./manipulation");
// const pluralize = require("pluralize");
const { Source, parse } = require("graphql"); // CommonJS
const { log } = require("./log");

function initSpiker() {
  const rawSchema = fs.readFileSync(
    `./repository/${process.env.REPO}/schema.graphql`,
    "utf8"
  );

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

  const customDirectives = `
    directive @spiker(table: String, field: String) on FIELD_DEFINITION
  
  `;
  const typeDefs = customDirectives + rawSchema;

  const queries = evaluateSchema(typeDefs);
  return [typeDefs, makeResolvers(tables, queries)];
}

/**
 { kind: 'Argument',
    name: { kind: 'Name', value: 'table', loc: [Object] },
    value:
     { kind: 'StringValue',
       value: 'BlogPost',
       block: false,
       loc: [Object] },
    loc: { start: 120, end: 137 } } 
**/
function astArgumentToLink(arg) {
  let linkDef = { table: undefined, field: undefined };
  // log(arg);
  switch (arg.name.value) {
    case "table":
      linkDef.table = arg.value.value;
      break;
    case "field":
      linkDef.field = arg.value.value;
      break;
  }
  // log(linkDef);
  return linkDef;
}

// Struct of a query definition built from the
// ast schema, to be used to build resolvers
function newQueryDef(name) {
  return {
    name,
    linkDef: undefined,
  };
}

// Parse schema and create queries and mutations
function evaluateSchema(typeDefs) {
  const s = new Source(typeDefs);
  const d = parse(s);

  const spikerQueries = [];

  d.definitions.forEach((def) => {
    switch (def.kind) {
      case "ObjectTypeDefinition":
        {
          if (def.name.kind === "Name" && def.name.value === "Query") {
            def.fields.forEach((field) => {
              // Query name in the schema
              const queryDef = newQueryDef(field.name.value);
              field.directives.forEach((dir) => {
                if (dir.name.value === "spiker") {
                  dir.arguments.forEach((arg) => {
                    // spiker directives
                    queryDef.linkDef = astArgumentToLink(arg);
                  });
                }
              });
              spikerQueries.push(queryDef);
            });
          }
        }
        break;
      default: {
        log("Unhandled --->", def.kind);
      }
    }
    // log(spikerQueries);
  });

  return spikerQueries;
}

// Using the table names, create generic resolvers
// that use the name and name with a "plural"
// Mutation: {
//   // createResponse: async (_, { response }, ctx) => {
//   //   const res = await addRow(ctx, 'traits', response);
//   //   return res;
//   // },
// },
function makeResolvers(tables, queries) {
  // const rtn = { Query: {}, Mutation: {} }
  const rtn = { Query: {} };

  log(`Reading all tables into memory...`);
  tables.forEach((t) => {
    if (t !== undefined) readCachedTable(t);
  });

  log(`Creating resolvers for tables...`);
  tables.forEach((t) => {
    if (t !== undefined) {
      // Look at the CSV fields, and if there is an xxxxx_id, try to
      // make a relation to that object automatically
      const fields = FILE_CACHE[t].meta.fields;
      rtn[t] = {};
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].endsWith("_id")) {
          // const relation = toTypeName(fields[i].split("_id")[0]);
          const relation = fields[i].split("_id")[0];
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

  // User defined queries in the schema
  queries.forEach((query) => {
    rtn.Query[query.name] = async (parent, args, ctx) => {
      return await getValues(parent, ctx, query.linkDef.table, args);
    };
  });

  return rtn;
}

module.exports = {
  initSpiker,
};
