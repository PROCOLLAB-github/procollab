/** @format */
// Inventory the real router tree, including lazy modules, without executing guards or API calls.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const app = path.join(root, "projects/social_platform/src/app");
const inventory = [];
const visited = new Set();
const read = file =>
  ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
const resolve = (from, name) => {
  if (name.startsWith(".")) return path.resolve(path.dirname(from), name) + ".ts";
  if (name.startsWith("@ui/")) return path.join(app, "ui", name.slice(4)) + ".ts";
};
function walk(file, prefix = "", inherited = []) {
  const key = file + ":" + prefix;
  if (visited.has(key)) return;
  visited.add(key);
  const source = read(file);
  const imports = new Map();
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      for (const item of statement.importClause.namedBindings.elements)
        imports.set(item.name.text, resolve(file, statement.moduleSpecifier.text));
    }
  }
  const literal = node => (node && ts.isStringLiteral(node) ? node.text : "");
  const processRoutes = (array, base, parents) => {
    for (const route of array.elements) {
      if (!ts.isObjectLiteralExpression(route)) continue;
      const props = new Map(
        route.properties
          .filter(ts.isPropertyAssignment)
          .map(p => [p.name.getText(source), p.initializer]),
      );
      const url = (base + "/" + literal(props.get("path"))).replace(/\/+/g, "/") || "/";
      const component = props.get("component")?.getText(source);
      const chain = [...parents, ...(component ? [component] : [])];
      if (component || props.has("redirectTo")) {
        const componentFile = imports.get(component);
        const scss = componentFile?.replace(/\.ts$/, ".scss");
        const styles = scss && fs.existsSync(scss) ? fs.readFileSync(scss, "utf8") : "";
        const issues = [];
        if (/min-width:\s*(?:[2-9]\d{2}|\d{4})px/.test(styles)) issues.push("fixed minimum width");
        if (/100vh/.test(styles)) issues.push("legacy viewport height");
        if (/grid-template-columns:.*(?:[2-9]fr|repeat\([2-9])/.test(styles))
          issues.push("multi-column layout");
        inventory.push({
          route: url,
          component,
          layout: chain,
          source: path.relative(root, file).replaceAll("\\", "/"),
          componentSource:
            componentFile && path.relative(root, componentFile).replaceAll("\\", "/"),
          redirect: literal(props.get("redirectTo")) || undefined,
          issues,
        });
      }
      const children = props.get("children");
      if (children && ts.isArrayLiteralExpression(children)) processRoutes(children, url, chain);
      const lazy = props.get("loadChildren");
      if (lazy) {
        let module;
        const visit = node => {
          if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
            module = literal(node.arguments[0]);
          ts.forEachChild(node, visit);
        };
        visit(lazy);
        if (module) walk(resolve(file, module), url, chain);
      }
    }
  };
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer))
        processRoutes(declaration.initializer, prefix, inherited);
    }
  }
}
walk(path.join(app, "app.routes.ts"));
fs.writeFileSync(path.join(__dirname, "routes.json"), JSON.stringify(inventory, null, 2) + "\n");
const screens = inventory.filter(row => row.component);
console.log(
  JSON.stringify(
    {
      screens: screens.length,
      redirects: inventory.length - screens.length,
      routes: screens.map(row => ({
        route: row.route,
        component: row.component,
        issues: row.issues,
      })),
    },
    null,
    2,
  ),
);
