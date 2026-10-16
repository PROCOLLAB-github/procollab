/** @format */

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const ts = require("typescript");
const baseline = "bc4940c57eab9eff59219593cfc8ed08f1a416bb";
const uiHead = "74a94c9b49f237c95e9c94bb7917882b794fd022";
const changed = cp
  .execFileSync("git", ["diff", baseline, uiHead, "--name-only", "--", "projects"], {
    encoding: "utf8",
  })
  .trim()
  .split(/\r?\n/);
const protectedPattern =
  /\/app\/(?:api|domain|data|routes)\/|\/use-cases\/|\/ports\/|(?:facade|permission|\.routes\.)/;
const protectedChanges = changed.filter(file => protectedPattern.test(file));
assert.deepEqual(
  protectedChanges,
  [],
  "UI Kit must preserve business/API/router/permission sources",
);
const printer = ts.createPrinter({ removeComments: true });
function source(revision, file) {
  try {
    return cp.execFileSync("git", ["show", `${revision}:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}
function methods(text, file) {
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const result = new Map();
  for (const declaration of ast.statements) {
    if (!ts.isClassDeclaration(declaration)) continue;
    for (const member of declaration.members) {
      if (
        !ts.isMethodDeclaration(member) &&
        !ts.isConstructorDeclaration(member) &&
        !ts.isGetAccessorDeclaration(member)
      )
        continue;
      const name = ts.isConstructorDeclaration(member) ? "constructor" : member.name.getText(ast);
      result.set(name, printer.printNode(ts.EmitHint.Unspecified, member, ast));
    }
  }
  return result;
}
const methodChanges = [];
for (const file of changed.filter(
  file => file.endsWith(".ts") && !/\.(spec|stories)\.ts$/.test(file),
)) {
  const before = source(baseline, file),
    after = source(uiHead, file);
  if (before === null || after === null) continue;
  const a = methods(before, file),
    b = methods(after, file);
  const names = [...new Set([...a.keys(), ...b.keys()])].filter(
    name => a.get(name) !== b.get(name),
  );
  if (names.length) methodChanges.push({ file, methods: names });
}
const reviewed = {
  "projects/social_platform/src/app/ui/pages/projects/edit/components/project-navigation/project-navigation.component.ts":
    "Tabs adapter delegates the same stepChange event through the existing onStepClick handler.",
  "projects/social_platform/src/app/ui/primitives/checkbox/checkbox.component.ts":
    "Native role/keyboard accessibility; disabled guard prevents toggling.",
  "projects/social_platform/src/app/ui/primitives/icon/icon.component.ts":
    "Legacy path reexports the canonical Icon class; the duplicate class is removed.",
  "projects/social_platform/src/app/ui/primitives/select/select.component.ts":
    "Keyboard opening/navigation, disabled guard and safe highlight scroll; CVA mapping is unchanged.",
  "projects/social_platform/src/app/ui/widgets/project-navigation/project-navigation.component.ts":
    "Duplicate class replaced by the same canonical navigation adapter.",
  "projects/ui/src/lib/components/primitives/avatar/avatar.component.ts":
    "Presentation consolidated with the existing app Avatar; empty lifecycle methods removed.",
  "projects/ui/src/lib/components/primitives/loader/loader.component.ts":
    "Loader color/appearance consolidated; empty lifecycle method removed.",
};
for (const change of methodChanges) {
  assert.ok(reviewed[change.file], `Unreviewed method change: ${change.file}`);
  change.review = reviewed[change.file];
}
const result = {
  baseline,
  uiHead,
  sourceFiles: changed.length,
  protectedChanges,
  methodChanges,
  scope: "UI Kit only; imported responsive commit is disclosed separately",
  responsiveInitializationExceptions: [
    "projects/social_platform/src/app/api/onboarding/facades/stages/onboarding-stage-zero-info.service.ts",
    "projects/social_platform/src/app/api/onboarding/facades/stages/ui/onboarding-stage-one-ui-info.service.ts",
  ],
};
fs.writeFileSync(
  path.join(__dirname, "business-boundary.json"),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `Business boundary: ${changed.length} UI sources, no protected-layer changes, ${methodChanges.length} reviewed classes`,
);
