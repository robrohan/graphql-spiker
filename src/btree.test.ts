import { newNode, insertInto, search, Node } from "./btree";
import { log } from "./log";

function mockTree(): Node {
  const root = newNode("0");
  const node0 = newNode("abc:def:1", { cat: "meow", dog: "woof" });
  const node1 = newNode("qqi:inf:19", { horse: "wheee", mouse: "squeak" });
  const node2 = newNode("iiqi:iof:39", { cat: "hissss", bird: "chirp" });
  const node3 = newNode("ziqi:iof:39", { cat: "purrr", bird: "squawk" });
  const node4 = newNode("aaa:iiof:239", { dog: "woof woof" });

  insertInto(root, node0);
  insertInto(root, node1);
  insertInto(root, node2);
  insertInto(root, node3);
  insertInto(root, node4);

  return root;
}

test("insertInto one level root node", () => {
  const root = newNode("0");
  const node = newNode("abc:def:1", { cat: "meow", dog: "woof" });

  insertInto(root, node);

  expect(root.left).toBeUndefined();
  expect(root.right).not.toBeUndefined();
});

test("insertInto several nodes", () => {
  const root = mockTree();

  expect(root.left).toBeUndefined();
  expect(root.right).not.toBeUndefined();
  expect(root.right.right).not.toBeUndefined();
  expect(root.right.right.left).not.toBeUndefined();
});

test("basic search by id", () => {
  const root = mockTree();
  const result = search(root, "qqi:inf:19");
  expect(result).toEqual({ horse: "wheee", mouse: "squeak" });
});

test("basic search by id 2", () => {
  const root = mockTree();
  const result = search(root, "ziqi:iof:39");
  expect(result).toEqual({ cat: "purrr", bird: "squawk" });
});

test("basic search by id no result", () => {
  const root = mockTree();
  const result = search(root, "ijijesoifjsefj");
  expect(result).toBeUndefined();
});

test("basic search by id no result 2", () => {
  const root = mockTree();
  const result = search(root, "iiqi:iof:40");
  expect(result).toBeUndefined();
});

test("basic search by id no result 3", () => {
  const root = mockTree();
  const result = search(root, undefined);
  expect(result).toBeUndefined();
});

test("Duplicate ID insert", () => {
  const root = mockTree();

  const node = newNode("iiqi:iof:39", { monkey: "poo", llama: "blurp" });
  insertInto(root, node);

  const result = search(root, "iiqi:iof:39");

  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toEqual(2);
});

test("Duplicate ID insert 3", () => {
  const root = mockTree();

  const node0 = newNode("iiqi:iof:39", { monkey: "poo", llama: "blurp" });
  const node1 = newNode("iiqi:iof:39", { tiger: "rawr", koala: "drop" });
  insertInto(root, node0);
  insertInto(root, node1);

  const result = search(root, "iiqi:iof:39");

  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toEqual(3);
});
