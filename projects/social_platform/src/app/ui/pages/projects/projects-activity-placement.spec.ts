/** @format */

import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("ProjectsComponent: размещение проектной активности", () => {
  const template = readFileSync(
    join(
      process.cwd(),
      "projects/social_platform/src/app/ui/pages/projects/projects.component.html",
    ),
    "utf8",
  );

  it("показывает блок только для dashboard и my", () => {
    expect(template).toMatch(
      /@if \(isMy\(\) \|\| isDashboard\(\)\) \{\s*<app-project-activity-card/,
    );
    expect(template.match(/<app-project-activity-card/g)).toHaveLength(1);
  });

  it.each(["isSubs()", "isInvites()", "isAll()"])("не привязывает блок к условию %s", condition => {
    const conditionalBlock = new RegExp(
      `@if \\(${condition.replace(/[()]/g, "\\$&")}\\) \\{[\\s\\S]*?<app-project-activity-card`,
    );
    expect(template).not.toMatch(conditionalBlock);
  });
});
