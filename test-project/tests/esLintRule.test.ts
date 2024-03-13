import { test, describe, expect } from "vitest";
import { ESLint } from "eslint";

const DEFAULT_ERROR = "default";
const MODULE_ERROR = "module";
const importError = (name: string) =>
  `Cannot import ${name === MODULE_ERROR ? MODULE_ERROR : `'${name}'`} outside its export scope`;

const eslint = new ESLint({ overrideConfigFile: ".eslintrc.js" });

const lint = async (file: string) => {
  const result = await eslint.lintFiles(`src/${file}`);

  return result.flatMap((x) => x.messages.map((x) => x.message));
};

const expectLintErr = (path: string, errors: string[]) => expect(lint(path)).resolves.toEqual(errors.map(importError));

test("can import from node_modules", async () => {
  await expectLintErr("nodeModulesTest.ts", []);
});

describe("folder scope default", () => {
  test("✔️", () => expectLintErr("generated/combinedSchema.ts", []));
  test("🚫", () => expectLintErr("combinedSchema.control.ts", ["schema", "subSchema"]));
});

describe("folder scope file exception", () => {
  test("✔️", () => expectLintErr("common/schemaParser.ts", []));
  test("🚫", () => expectLintErr("common/schemaParser.control.ts", ["schema"]));
});

describe("folder scope folder exception", () => {
  test("✔️", () => expectLintErr("components/SchemaConsumer/schemaContext.ts", []));
  test("🚫", () => expectLintErr("components/control/schemaContext.control.ts", ["schema"]));
});

describe("index files are accessible one dir up", () => {
  test("✔️", () => expectLintErr("constants/index.ts", []));
  test("🚫", () => expectLintErr("constants/index.control.ts", ["PRIVATE_CONSTANT"]));
});

describe("file scope", () => {
  test("✔️", () => expectLintErr("constantConsumer/consumer.ts", []));
  test("🚫", () => expectLintErr("constantConsumer/consumer.control.ts", ["CONSTANT2", "CONSTANT1"]));
});

describe("export scope ..", () => {
  test("✔️", () => expectLintErr("components/colors.ts", []));
  test("🚫", () => expectLintErr("colors.control.ts", ["color"]));
});

describe("export scope *", () => {
  test("✔️", () => expectLintErr("components/control/globalImport.ts", []));
});

describe("export scope absolute path", () => {
  test("✔️", () => expectLintErr("components/control/componentCollection.ts", []));
  test("🚫", () => expectLintErr("common/componentCollection.control.ts", [DEFAULT_ERROR]));
});

describe("aliased export", () => {
  test("✔️", () => expectLintErr("aliasedExport/aliasedExportTest.ts", ["privateSecret"]));
});

describe("export scope folder exception", () => {
  test("✔️", () => expectLintErr("common/commonColors.ts", []));
});

describe("export scope file exception", () => {
  test("✔️", () => expectLintErr("constants/constants.global.ts", []));
  test("🚫", () => expectLintErr("constants/constants.local.ts", ["color"]));
});

describe("dynamic imports", () => {
  test("✔️", () => expectLintErr("dynamicImport/index.ts", [MODULE_ERROR, MODULE_ERROR, "PRIVATE"]));
});

describe("star import", () => {
  test("✔️", () => expectLintErr("starImport/index.ts", ["PRIVATE", "PRIVATE"]));
});

describe(".scope.js files are respected", () => {
  test("✔️", () => expectLintErr("scope-dot-js/import.js", []));
});

describe(".scope.ts files don't affect export scopes of children", () => {
  test("✔️", () => expectLintErr("commonInternal.ts", ["INTERNAL"]));
});

describe(".scope.ts in the project root becomes global default", () => {
  test("✔️", () => expectLintErr("globalPackageTest.ts", []));
});

describe("index files inherit scope from parent .scope.ts files", () => {
  test("✔️", () => expectLintErr("indexInheritsParentScope.ts", []));
  test("🚫", () => expectLintErr("indexInheritsParentScope.control.ts", ["part"]));
});
