/** @format */

import { FormArray, FormBuilder } from "@angular/forms";
import { createProjectAchievementGroup, createProjectForm } from "./project-form.factory";

describe("project-form.factory", () => {
  const fb = new FormBuilder();

  it("создаёт основную форму проекта с ожидаемыми обязательными полями", () => {
    const form = createProjectForm(fb);

    expect(form.get("name")?.hasError("required")).toBe(true);
    expect(form.get("region")?.hasError("required")).toBe(true);
    expect(form.get("industryId")?.hasError("required")).toBe(true);
    expect(form.get("description")?.hasError("required")).toBe(true);
    expect(form.get("coverImageAddress")?.hasError("required")).toBe(true);
    expect(form.get("targetAudience")?.hasError("required")).toBe(true);
    expect(form.get("problem")?.hasError("required")).toBe(true);
    expect(form.get("links")).toEqual(jasmine.any(FormArray));
    expect(form.get("achievements")).toEqual(jasmine.any(FormArray));
  });

  it("валидирует поле link только для http/https адресов", () => {
    const form = createProjectForm(fb);
    const linkControl = form.get("link");

    linkControl?.setValue("ftp://example.com");
    expect(linkControl?.hasError("pattern")).toBe(true);

    linkControl?.setValue("https://example.com");
    expect(linkControl?.valid).toBe(true);
  });

  it("создаёт группу достижения с fallback id и валидацией года", () => {
    const achievement = createProjectAchievementGroup(
      fb,
      { title: "MVP", status: "1999" },
      3,
      2026
    );

    expect(achievement.get("id")?.value).toBe(3);
    expect(achievement.get("status")?.hasError("min")).toBe(true);

    achievement.get("status")?.setValue("2027");
    expect(achievement.get("status")?.hasError("max")).toBe(true);

    achievement.get("status")?.setValue("2025");
    expect(achievement.valid).toBe(true);
  });
});
