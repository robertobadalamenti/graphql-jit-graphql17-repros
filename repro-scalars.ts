import {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  execute,
  parse,
  type DocumentNode,
} from "graphql";
import { compileQuery, isCompiledQuery } from "graphql-jit";

const Custom = new GraphQLScalarType({
  name: "Custom",
  serialize: (value) => `legacy-output:${value}`,
  coerceOutputValue: (value) => `v17-output:${value}`,
  parseValue: (value) => `legacy-input:${value}`,
  coerceInputValue: (value) => `v17-input:${value}`,
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      echo: {
        type: Custom,
        args: { value: { type: Custom } },
        resolve: (_, args) => args.value,
      },
    },
  }),
});

const document = parse(`query ($value: Custom) { echo(value: $value) }`);
const variableValues = { value: "x" };

async function runGraphQL(
  schema: GraphQLSchema,
  document: DocumentNode,
  variableValues: Record<string, unknown>,
) {
  return execute({ schema, document, variableValues });
}

async function runGraphQLJit(
  schema: GraphQLSchema,
  document: DocumentNode,
  variableValues: Record<string, unknown>,
) {
  const compiled = compileQuery(schema, document);

  if (!isCompiledQuery(compiled)) {
    throw new Error(JSON.stringify(compiled));
  }

  return compiled.query(undefined, {}, variableValues);
}

console.log("graphql-js:");
console.log(
  JSON.stringify(await runGraphQL(schema, document, variableValues), null, 2),
);

console.log("\ngraphql-jit:");
console.log(
  JSON.stringify(await runGraphQLJit(schema, document, variableValues), null, 2),
);