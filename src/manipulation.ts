const pluralize = require("pluralize");

export type TypeName = string;
export type TableFileName = string;

// Tries to make sure whatever you pass it looks
// like what a table name would look like.
export function toFileName(typename: string): TableFileName {
  const single = pluralize(typename, 1);
  const fntn = toTypeName(single);
  return fntn.slice(0, 1).toUpperCase() + fntn.slice(1);
}

// Make sure the first char is lowercase, and any _<letter>
// upper cases the next letter. So you wind up with something
// like: foodCategory
export function toTypeName(filename: string): TypeName {
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

export function isPluralized(str: string): boolean {
  return str.toLowerCase() === pluralize(str.toLowerCase(), 1);
}
