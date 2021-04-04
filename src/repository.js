require("dotenv").config();
const fs = require("fs");
const pluralize = require("pluralize");
const Papa = require("papaparse");
const { log } = require("./log");
////////////////////////////////////////////////

// Just to keep people from doing large datasets
// and crashing things.
const MAX_RESULTS = 1000;
// Object to hold files once read from disk
const FILE_CACHE = {};

// Read a "table" (aka csv file) from disk
function readCachedTable(table, reload = false) {
  if (FILE_CACHE[table] === undefined || reload === true) {
    const csv = Papa.parse(
      fs.readFileSync(`./repository/${process.env.REPO}/${table}.csv`, "utf8"),
      {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        skipEmptyLines: false,
        columns: null,
      }
    );
    FILE_CACHE[table] = csv;
  }
  return FILE_CACHE[table];
}

// Quick and dirty (and very non-performant) search
// loop over all the data in memory and apply the
// filters to each row. This is knowingly O(N^2).
// Think I might play around with a tree if this gets
// used for more than spikes, but this is not a database
// ... or is it?
function filterRecords(data, filter) {
  log("Filter:", filter);

  const records = [];
  const filterKeys = Object.keys(filter);
  const filterKeyLen = filterKeys.length;

  if (filterKeyLen === 0) {
    return data;
  }

  for (let r = 0; r < data.length; r++) {
    const record = data[r];

    let match = false;
    for (let i = 0; i < filterKeyLen; i++) {
      let key = filterKeys[i];
      // if a one-to-many, check each item to see
      // if it matches - this only applies to a filter
      // that is an array id: [1,2,3]
      if (Array.isArray(filter[key])) {
        // Yeah! O(N^2)
        for (let q = 0; q < filter[key].length; q++) {
          if (record[key] === filter[key][q]) {
            match = true;
            break;
          }
        }
      } else if (record[key] === filter[key]) {
        // basic check of this one filter item
        match = true;
      } else {
        // doesn't match, no need to check other filter
        // params
        match = false;
        break;
      }
    }

    if (match) records.push(record);
    if (records.length >= MAX_RESULTS) break;
  }
  return records;
}

// Scan a table using a set of filters. This is
// perfect match only
function scanTable(table, filter) {
  const data = readCachedTable(table).data;

  const records = filterRecords(data, filter);

  // An ID query should only return one record
  // just assume it's idx zero or null.
  if (filter.hasOwnProperty("id") && !Array.isArray(filter["id"])) {
    return records[0] || undefined;
  }

  // log(records);
  return records;
}

function isPluralized(str) {
  return str.toLowerCase() === pluralize(str.toLowerCase(), 1);
}

async function getValues(parent, ctx, sheet, args) {
  // if we have a parent, we might have a single or array
  // type query (one to one, one to many)...
  if (parent) {
    const id = parent[sheet.toLowerCase() + "_id"];
    // assume , list or one-to-many
    if (id && !isPluralized(sheet)) {
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
  FILE_CACHE,
};
