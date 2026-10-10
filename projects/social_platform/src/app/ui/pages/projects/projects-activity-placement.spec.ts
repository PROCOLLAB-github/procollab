/** @format */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseTemplate,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstNode,
  TmplAstTemplate,
} from "@angular/compiler";

describe("ProjectsComponent: размещение проектной активности", () => {
  const template = readFileSync(
    join(
      process.cwd(),
      "projects/social_platform/src/app/ui/pages/projects/projects.component.html",
    ),
    "utf8",
  );

  const activityConditions: string[][] = [];
  const walk = (nodes: TmplAstNode[], conditions: string[] = []) => {
    for (const node of nodes) {
      if (node instanceof TmplAstIfBlock) {
        for (const branch of node.branches) {
          walk(branch.children, [...conditions, branch.expression?.source || "else"]);
        }
      } else if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
        if (node instanceof TmplAstElement && node.name === "app-project-activity-card") {
          activityConditions.push(conditions);
        }
        walk(node.children, conditions);
      } else if (node instanceof TmplAstForLoopBlock) {
        walk(node.children, conditions);
      }
    }
  };
  walk(parseTemplate(template, "projects.component.html").nodes);

  it("показывает блок только для dashboard и my", () => {
    expect(activityConditions.length).toBeGreaterThan(0);
    for (const conditions of activityConditions) {
      expect(conditions).toContain("isMy() || isDashboard()");
    }
  });

  it.each(["isSubs()", "isInvites()", "isAll()"])("не привязывает блок к условию %s", condition => {
    for (const conditions of activityConditions) {
      expect(conditions).not.toContain(condition);
    }
  });
});
