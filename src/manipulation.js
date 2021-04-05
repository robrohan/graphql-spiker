const { log } = require("./log");
const pluralize = require("pluralize");

// Tries to make sure whatever you pass it looks
// like what a table name would look like.
function toFileName(typename) {
  const single = pluralize(typename, 1);
  const fntn = toTypeName(single);
  return fntn.slice(0, 1).toUpperCase() + fntn.slice(1);
}

// Make sure the first char is lowercase, and any _<letter>
// upper cases the next letter. So you wind up with something
// like: foodCategory
function toTypeName(filename) {
  const len = filename.length;
  let newString = [];

  let upcase = false;
  for (let i = 0; i < len; i++) {
    if (i === 0) {
      newString.push(filename[i].toLowerCase());
      continue;
    }

    if (filename[i] === "_") {
      upcase = true;
      continue;
    }

    if (upcase === true) {
      newString.push(filename[i].toUpperCase());
      upcase = false;
      continue;
    }

    newString.push(filename[i]);
  }

  return newString.join("");
}

module.exports = {
  toTypeName,
  toFileName,
};
