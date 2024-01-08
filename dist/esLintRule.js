"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = exports.ruleName = void 0;
const utils_1 = require("@typescript-eslint/utils");
const common_1 = require("./common");
exports.ruleName = "no-imports-outside-export-scope";
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://github.com/A-Shleifman/eslint-plugin-export-scope");
exports.rule = createRule({
    name: exports.ruleName,
    meta: {
        type: "problem",
        docs: {
            description: "Disallows importing scoped exports outside their scope",
        },
        messages: {
            exportScope: "Cannot import {{ identifier }} outside its export scope",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = utils_1.ESLintUtils.getParserServices(context);
        const checkIsAccessible = (props) => (0, common_1.checkIsAccessible)(Object.assign({ tsProgram: services.program, importPath: context.filename }, props));
        const validateNode = (node, exportName) => {
            var _a, _b;
            const parseNode = "source" in node ? node.source : node.parent && "source" in node.parent ? node.parent.source : node;
            if (!parseNode)
                return;
            const importSymbol = services.getSymbolAtLocation(parseNode);
            const exportPath = (_b = (_a = importSymbol === null || importSymbol === void 0 ? void 0 : importSymbol.declarations) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.getSourceFile().fileName;
            if (!checkIsAccessible({ exportPath, exportName })) {
                context.report({
                    node,
                    messageId: "exportScope",
                    data: { identifier: exportName ? `'${exportName}'` : "module" },
                });
            }
        };
        return {
            ImportDeclaration: (node) => !node.specifiers.length && validateNode(node),
            ImportExpression: (node) => validateNode(node),
            ImportSpecifier: (node) => validateNode(node, node.imported.name),
            ImportDefaultSpecifier: (node) => validateNode(node, "default"),
        };
    },
});
