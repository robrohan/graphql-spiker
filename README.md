# GraphQL Spiker

GraphQL Spiker is an application that provides a GraphQL server backed by local CSV files. This is useful when you want to play around with schemas you are designing or to spike a service that isn't done yet.

It could also be used for proof of concept ideas, or super small internal services.

## How it Works

1. Define a schema in the repository directory: `sheet.graphql`
1. Create CSV files in the same directory with the name of the Types you define in the schema. Case matters, use uppercase object names. Meaning:

```
type Category ---> Category.csv
```

### Basic Object

The column names in the CSV should match the property names of the class. For example the following graphql object:

```gql
type Trait {
  id: ID!
  label: String!
  percent: Float!
}
```

Could be backed by the following CSV:

```csv
"id","label","percent"
"1","things","0.5"
```

Additionally, _any_ object you add needs to be added to the query section for a singular select and a plural select. For example, Traits above _must_ have this is the graphql schema Query section:

```gql
type Query {
  ...
  trait(id: ID!): Trait
  traits: [Trait!]!
  ...
}
```

The server will error on start up if all objects in the schema do not have both of these defined for every type.

### One to One

For a one-to-one relationship, define the graphql schema as you would:

```gql
type Category {
  id: ID!
  text: String!
}

type Trait {
  id: ID!
  label: String!
  percent: Float!
  category: Category
}
```

Then in the CSV add a column with the name of the related object with "\_id" after the column name:

```csv
(Trait.csv)
"id","category_id","label","percent"
"1","1","things","0.5"
"2","2","stuff blarg","0.43"

(Category.csv)
"id","text"
"1","category 1"
"2","category 2"
```

### One to Many

For one to many, define the relationship as you would in graphql schema:

```gql
type Tag {
  id: ID!
  text: String!
}

type Trait {
  id: ID!
  label: String!
  percent: Float!
  tags: [Tag]
}
```

Then in the CSV you add a column with the plural version of the related object with "\_id" after the column name. For example:

```csv
(Trait.csv)
"id","label","percent","tags_id"
"1","things","0.5","1"
"2","stuff blarg","0.43","1,2"

(Tag.csv)
"id","text"
"1","tag 1"
"2","tag 2"
```

Note to link many items, the column value is a comma separated list of external IDs.

---

![running](docs/spiker_running.png)
