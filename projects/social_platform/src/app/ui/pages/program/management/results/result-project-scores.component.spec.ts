/** @format */
import { TestBed } from "@angular/core/testing";
import { ResultProjectScoresComponent } from "./result-project-scores.component";
import { ManagementCriterion } from "@domain/program/program-criteria.model";
import { ResultProject } from "@domain/program/program-results.model";

describe("Общие оценки проекта", () => {
  it("сохраняет нулевые баллы, Нет, комментарии и раскрытие ожидающего эксперта", () => {
    const criteria: ManagementCriterion[] = [
      { id: 1, name: "Решение", type: "int", minValue: 0, maxValue: 10, description: null },
      { id: 2, name: "Готово", type: "bool", minValue: null, maxValue: null, description: null },
      {
        id: 3,
        name: "Комментарий",
        type: "str",
        minValue: null,
        maxValue: null,
        description: null,
      },
    ];
    const project: ResultProject = {
      id: 11,
      projectId: 91,
      name: "Проект",
      caseName: "Кейс",
      completed: 1,
      required: 2,
      ready: false,
      score: 0,
      place: null,
      averages: { "1": 0 },
      experts: [
        {
          userId: 1,
          name: "Первый Эксперт",
          email: "first@example.test",
          avatar: null,
          complete: true,
          total: 0,
          values: [
            { criterionId: 1, value: "0" },
            { criterionId: 2, value: "False" },
            { criterionId: 3, value: "Текст\nкомментария" },
          ],
        },
        {
          userId: 2,
          name: "Второй Эксперт",
          email: "second@example.test",
          avatar: null,
          complete: false,
          total: null,
          values: [],
        },
      ],
    };
    const fixture = TestBed.createComponent(ResultProjectScoresComponent);
    fixture.componentRef.setInput("project", project);
    fixture.componentRef.setInput("criteria", criteria);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector("table")?.textContent).toContain("0,00");
    expect(element.querySelector("table")?.textContent).toContain("Нет");
    expect(element.querySelector("table")?.textContent).toContain("Решение · до 10");
    expect(element.querySelector(".results__comments")?.textContent).toContain(
      "Текст\nкомментария",
    );
    expect(element.querySelectorAll(".results__badge--ready")).toHaveLength(1);
    const expert = element.querySelectorAll<HTMLButtonElement>(".results__expert")[1];
    expect(expert.getAttribute("aria-expanded")).toBe("false");
    expert.click();
    fixture.detectChanges();
    expect(expert.getAttribute("aria-expanded")).toBe("true");
    expect(
      [...element.querySelectorAll(".results__expert-values dd")].map(n => n.textContent?.trim()),
    ).toEqual(["—", "—", "—"]);
    expert.click();
    fixture.detectChanges();
    expect(element.querySelector(".results__expert-values")).toBeNull();
  });
});
