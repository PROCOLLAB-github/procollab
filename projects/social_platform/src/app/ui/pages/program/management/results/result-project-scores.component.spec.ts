/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
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
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
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
    const expert = element.querySelectorAll<HTMLButtonElement>(".results__expert-toggle")[1];
    expect(expert.getAttribute("aria-expanded")).toBe("false");
    expert.click();
    fixture.detectChanges();
    expect(expert.getAttribute("aria-expanded")).toBe("true");
    expect(
      [...element.querySelectorAll(".results__expert-values dd")].map(n => n.textContent?.trim()),
    ).toEqual(["—", "—"]);
    expect(element.querySelector(".results__detail-heading a")?.getAttribute("href")).toBe(
      "/office/projects/91",
    );
    expect(element.querySelector(".results__matrix a")?.getAttribute("href")).toBe(
      "/office/profile/1",
    );
    expect(element.querySelector(".results__comments")?.textContent).not.toContain(
      "Второй Эксперт",
    );
    expert.click();
    fixture.detectChanges();
    expect(element.querySelector(".results__expert-values")).toBeNull();
  });
  it("без числовых критериев сохраняет Нет и профили, не показывает пустые комментарии или обещание места", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ResultProjectScoresComponent);
    fixture.componentRef.setInput("criteria", [
      { id: 1, name: "Условия", type: "bool", minValue: null, maxValue: null, description: null },
      {
        id: 2,
        name: "Комментарий",
        type: "str",
        minValue: null,
        maxValue: null,
        description: null,
      },
    ]);
    fixture.componentRef.setInput("project", {
      id: 11,
      projectId: 91,
      name: "Проект",
      caseName: null,
      completed: 1,
      required: 1,
      evaluationComplete: true,
      ready: false,
      score: null,
      place: null,
      averages: {},
      experts: [
        {
          userId: 1,
          name: "Эксперт",
          email: "e@example.test",
          avatar: null,
          complete: true,
          total: null,
          values: [
            { criterionId: 1, value: "False" },
            { criterionId: 2, value: "" },
          ],
        },
      ],
    });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Нет");
    expect(text).not.toContain("Сумма баллов");
    expect(text).not.toContain("Среднее");
    expect(text).not.toContain("Место появится");
    expect(fixture.nativeElement.querySelector(".results__comments")).toBeNull();
  });
});
