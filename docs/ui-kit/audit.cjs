/** @format */

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const assert = require("node:assert/strict");
const roots = ["projects/social_platform/src/app/ui", "projects/ui/src/lib/components"];
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(e => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const selectors = new Map();
for (const file of roots
  .flatMap(files)
  .filter(f => f.endsWith(".ts") && !/\.(spec|stories)\.ts$/.test(f))) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/selector:\s*["']([^"']+)["']/g)) {
    const list = selectors.get(match[1]) || [];
    list.push(file.replaceAll("\\", "/"));
    selectors.set(match[1], list);
  }
}
const canonical = [
  "app-button",
  "[appIcon]",
  "app-avatar",
  "app-loader",
  "app-project-navigation",
  "app-tabs",
  "app-state",
  "app-page-header",
  "app-badge",
  "app-pagination",
];
const implementations = Object.fromEntries(
  canonical.map(name => [name, selectors.get(name) || []]),
);
for (const [selector, paths] of Object.entries(implementations))
  assert.equal(paths.length, 1, selector + " must have one implementation");
const rawColors = roots
  .flatMap(files)
  .filter(f => f.endsWith(".scss"))
  .flatMap(file => {
    const source = fs.readFileSync(file, "utf8");
    return [...source.matchAll(/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/gi)].map(m => ({
      file,
      color: m[0],
    }));
  });
assert.deepEqual(rawColors, [], "Component palette belongs in tokens");
const changed = cp
  .execFileSync(
    "git",
    [
      "-c",
      "core.autocrlf=false",
      "diff",
      "bc4940c57eab9eff59219593cfc8ed08f1a416bb",
      "--name-only",
    ],
    { encoding: "utf8" },
  )
  .trim()
  .split(/\r?\n/)
  .filter(file => file.startsWith("projects/"));
const added = cp
  .execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" })
  .trim()
  .split(/\r?\n/)
  .filter(file => file.startsWith("projects/"));
const allChanged = [...new Set([...changed, ...added])].sort();
assert.ok(
  allChanged.every(file => /\/ui\/|projects\/ui\/|\/styles(?:\/|\.scss)/.test(file)),
  "UI migration must not change facades, API, routes or permissions",
);
const report = {
  implementations,
  rawColors,
  changedFiles: allChanged,
  componentTemplates: allChanged.filter(f => f.endsWith(".component.html")),
};
fs.writeFileSync(path.join(__dirname, "audit.json"), JSON.stringify(report, null, 2) + "\n");
console.log(
  `${canonical.length} canonical components; no duplicate implementations or raw component colors; ${report.componentTemplates.filter(file => fs.existsSync(file)).length} migrated templates, ${report.componentTemplates.filter(file => !fs.existsSync(file)).length} removed duplicate templates`,
);
