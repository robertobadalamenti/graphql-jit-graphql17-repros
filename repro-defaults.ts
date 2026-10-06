import { buildSchema, execute, parse } from "graphql";
import type { DocumentNode, GraphQLSchema } from "graphql";
import { compileQuery, isCompiledQuery } from "graphql-jit";
const schema = buildSchema(`
  input In {
    x: Int = 5
  }

  type Query {
    echo(a: Int = 3, input: In): String
  }
`);

schema.getQueryType()!.getFields().echo.resolve = (_, args) =>
  JSON.stringify(args);

const document = parse(`{ echo(input: {}) }`);

async function runGraphQL(schema: GraphQLSchema, document: DocumentNode) {
  return execute({ schema, document });
}

async function runGraphQLJit(schema: GraphQLSchema, document: DocumentNode) {
  const compiled = compileQuery(schema, document);

  if (!isCompiledQuery(compiled)) {
    throw new Error(JSON.stringify(compiled));
  }

  return compiled.query(undefined, {}, {});
}

console.log("graphql-js:");
console.log(JSON.stringify(await runGraphQL(schema, document), null, 2));

console.log("\ngraphql-jit:");
console.log(JSON.stringify(await runGraphQLJit(schema, document), null, 2));