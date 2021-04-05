function newNode(id, data) {
  return {
    id: id || "0",
    left: undefined,
    right: undefined,
    data: data || undefined,
  };
}

function insertInto(parent, node) {
  // if data is equal to the ID then append to data array
  if (parent.id === node.id) {
    if (parent.data === undefined) parent.data = node.data;
    if (parent.data) {
      if (Array.isArray(parent.data)) {
        parent.data = [...parent.data, node.data];
      } else {
        parent.data = [parent.data, node.data];
      }
    }
  }

  // check if the parents data is less than our data
  // if so visit left
  if (parent.id > node.id && parent.left === undefined) {
    parent.left = node;
  } else if (parent.id > node.id && parent.left !== undefined) {
    return insertInto(parent.left, node);
  }

  // if data is greater than our data go right
  if (parent.id < node.id && parent.right === undefined) {
    parent.right = node;
  } else if (parent.id < node.id && parent.right !== undefined) {
    return insertInto(parent.right, node);
  }
}

function search(parent, query) {
  if (parent === undefined || query === undefined) return undefined;
  if (parent.id === query) {
    return parent.data;
  }
  if (parent.id > query) {
    return search(parent.left, query);
  }
  if (parent.id < query) {
    return search(parent.right, query);
  }
}

module.exports = {
  newNode,
  insertInto,
  search,
};
