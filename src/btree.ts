
export type Data = any;
export type Node = {
  id: string,
  left: Node,
  right: Node,
  data: Data,
};

export function newNode(id: string, data?: Data) {
  return {
    id: id || "0",
    left: undefined,
    right: undefined,
    data: data || undefined,
  };
}

export function insertInto(parent: Node, node: Node): void {
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

export function search(parent: Node, idQuery: string): Data {
  if (parent === undefined || idQuery === undefined) return undefined;
  if (parent.id === idQuery) {
    return parent.data;
  }
  if (parent.id > idQuery) {
    return search(parent.left, idQuery);
  }
  if (parent.id < idQuery) {
    return search(parent.right, idQuery);
  }
}
