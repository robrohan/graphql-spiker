require("dotenv").config();
const fs = require("fs");
const pluralize = require("pluralize");
const Papa = require("papaparse");

// Object to hold files once read from disk
const fileCache = {};

// Read a "table" (aka csv file) from disk
function readCachedTable(table, reload = false) {
  if (fileCache[table] === undefined || reload === true) {
    const csv = Papa.parse(
      fs.readFileSync(`./repository/${process.env.REPO}/${table}.csv`, "utf8"),
      {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\n",
        skipEmptyLines: false,
        columns: null,
      }
    );
    fileCache[table] = csv;
  }
  return fileCache[table];
}

// Scan a table using a set of filters. This is
// perfect match only
function scanTable(table, filter) {
  const data = readCachedTable(table).data;
  const filterKeys = Object.keys(filter);
  const fklen = filterKeys.length;

  // No filter, just return everything.
  if (fklen === 0) {
    return data;
  }

  // Quick and dirty (and non-performat) search
  {
    const records = data.filter((r) => {
      for (let i = 0; i < fklen; i++) {
        let key = filterKeys[i];
        // if a one-to-many, check each item to see
        // if it matches
        if (Array.isArray(filter[key])) {
          for (let q = 0; q < filter[key].length; q++) {
            if (r[key] === filter[key][q]) {
              return true;
            }
          }
        } else if (r[key] === filter[key]) {
          // basic check
          return true;
        }
      }

      return false;
    });

    // An ID query should only return one record
    // just assume it's idx zero or null.
    if (filter.hasOwnProperty("id") && !Array.isArray(filter["id"])) {
      return records[0] || undefined;
    }

    return records;
  }
}

async function getValues(parent, ctx, sheet, args) {
  // if we have a parent, we might have a single or array
  // type query (one to one, one to many)...
  if (parent) {
    const id = parent[sheet.toLowerCase() + "_id"];
    // assume , list or one-to-many
    if (id && sheet.toLowerCase() !== pluralize(sheet.toLowerCase(), 1)) {
      args["id"] = id.split(",");
    } else if (id) {
      // or just ID
      args["id"] = id;
    }
  }

  // force table into non-plural
  return scanTable(pluralize(sheet, 1), args);
}

module.exports = {
  getValues,
  readCachedTable,
  fileCache,
};
