/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectCount } from "@domain/project/project.model";
import { ProjectActivityCardComponent } from "./project-activity-card.component";

describe("ProjectActivityCardComponent", () => {
  const count = (overrides: Partial<ProjectCount> = {}): ProjectCount => ({
    all: 0,
    my: 3,
    subs: 0,
    myLeader: 2,
    myInProgram: 1,
    mySubmitted: 4,
    ...overrides,
  });

  function render(value = count(), state: "loaded" | "loading" | "error" = "loaded") {
    const fixture = TestBed.createComponent(ProjectActivityCardComponent);
    fixture.componentRef.setInput("count", value);
    fixture.componentRef.setInput("state", state);
    fixture.detectChanges();
    return fixture;
  }

  it("показывает четыре значения authoritative count", () => {
    const element = render().nativeElement as HTMLElement;
    const rows = Array.from(element.querySelectorAll(".activity__metric"));

    expect(rows).toHaveLength(4);
    expect(rows.map(row => row.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "Проектов 3",
      "Я лидер 2",
      "В программе 1",
      "Сдано 4",
    ]);
  });

  it("отображает нули как числа и не содержит текст старой заглушки", () => {
    const element = render(count({ my: 0, myLeader: 0, myInProgram: 0, mySubmitted: 0 }))
      .nativeElement as HTMLElement;

    expect(element.querySelectorAll(".activity__value")).toHaveLength(4);
    expect(
      Array.from(element.querySelectorAll(".activity__value")).map(x => x.textContent?.trim()),
    ).toEqual(["0", "0", "0", "0"]);
    expect(element.textContent).not.toContain("скоро");
    expect(element.textContent).not.toContain("пока закрыто");
    expect(element.textContent).not.toContain("Подробнее");
    expect(element.querySelector("button, a")).toBeNull();
  });

  it.each(["loading", "error"] as const)("не показывает выдуманные числа в состоянии %s", state => {
    const element = render(count(), state).nativeElement as HTMLElement;
    expect(
      Array.from(element.querySelectorAll(".activity__value")).map(x => x.textContent?.trim()),
    ).toEqual(["—", "—", "—", "—"]);
  });

  it("сохраняет заголовок в обычном регистре и декоративные иконки", () => {
    const element = render().nativeElement as HTMLElement;
    expect(element.querySelector("h2")?.textContent?.trim()).toBe("Моя активность");
    expect(element.querySelectorAll('.activity__icon[aria-hidden="true"]')).toHaveLength(4);
  });

  it.each([0, 26, 123, 9999, 999999999999])(
    "не подменяет значение %s сокращённым числом",
    value => {
      const element = render(count({ my: value })).nativeElement as HTMLElement;
      const counter = element.querySelector<HTMLElement>(".activity__value")!;
      expect(counter.textContent?.trim()).toBe(String(value));
      expect(counter.title).toBe(String(value));
    },
  );

  it("при повторной загрузке убирает устаревшие числа, включая title", () => {
    const fixture = render(count({ my: 9999 }));
    for (const state of ["loading", "error"] as const) {
      fixture.componentRef.setInput("state", state);
      fixture.detectChanges();
      const values = Array.from(
        fixture.nativeElement.querySelectorAll(".activity__value"),
      ) as HTMLElement[];
      expect(values.map(element => element.textContent?.trim())).toEqual(["—", "—", "—", "—"]);
      expect(values.every(element => !element.hasAttribute("title"))).toBe(true);
    }
  });
});
