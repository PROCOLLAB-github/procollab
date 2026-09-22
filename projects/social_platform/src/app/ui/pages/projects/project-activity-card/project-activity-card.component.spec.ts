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
  });

  it.each(["loading", "error"] as const)("не показывает выдуманные числа в состоянии %s", state => {
    const element = render(count(), state).nativeElement as HTMLElement;
    expect(
      Array.from(element.querySelectorAll(".activity__value")).map(x => x.textContent?.trim()),
    ).toEqual(["—", "—", "—", "—"]);
  });
});
