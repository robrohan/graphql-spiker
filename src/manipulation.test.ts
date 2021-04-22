import { toTypeName, toFileName } from "./manipulation";
const pluralize = require("pluralize");

test("case tweaks", () => {
  expect(toTypeName("food_category")).toEqual("foodCategory");
  expect(toTypeName(pluralize("food_category", 2))).toEqual("foodCategories");
  expect(toTypeName("Food")).toEqual("food");
  expect(toTypeName("Food_category")).toEqual("foodCategory");
  expect(toTypeName(pluralize("Food"))).toEqual("foods");
});

test("ensure filename", () => {
  expect(toFileName("food_category")).toEqual("FoodCategory");
  expect(toFileName("Food_category")).toEqual("FoodCategory");
  expect(toFileName("Food_categories")).toEqual("FoodCategory");
});
