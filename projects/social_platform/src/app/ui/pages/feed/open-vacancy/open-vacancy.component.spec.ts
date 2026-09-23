/** @format */

import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { OpenVacancyComponent } from "./open-vacancy.component";

describe("OpenVacancyComponent", () => {
  it("показывает тип, дату, источник, роль, описание, навыки и CTA", () => {
    TestBed.configureTestingModule({
      imports: [OpenVacancyComponent, RouterTestingModule],
      providers: [
        { provide: IndustryRepositoryPort, useValue: { getOne: () => ({ name: "IT" }) } },
      ],
    });
    const fixture = TestBed.createComponent(OpenVacancyComponent);
    fixture.componentRef.setInput("feedItem", {
      id: 7,
      role: "Frontend-разработчик",
      description: "Создание интерфейсов для платформы.",
      project: { id: 3, name: "Проект А", imageAddress: "", industry: 1 },
      requiredSkills: [
        { id: 1, name: "Angular" },
        { id: 2, name: "TypeScript" },
      ],
    } as Vacancy);
    fixture.componentRef.setInput("publishedAt", "2026-09-23T12:00:00Z");
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector(".card__type")?.textContent?.trim()).toBe("Новая вакансия");
    expect(element.querySelector(".card__date")?.textContent?.trim()).toBe("23.09.2026");
    expect(element.querySelector(".card__source-text")?.textContent).toContain("Проект А");
    expect(element.querySelector(".card__title")?.textContent?.trim()).toBe("Frontend-разработчик");
    expect(element.querySelector(".card__description")?.textContent).toContain(
      "Создание интерфейсов",
    );
    expect(
      Array.from(element.querySelectorAll(".card__skill")).map(node => node.textContent?.trim()),
    ).toEqual(["Angular", "TypeScript"]);
    expect(element.querySelector(".card__industry")?.textContent?.trim()).toBe("IT");
    expect(element.querySelector(".card__cta")?.textContent).toContain("Подробнее о вакансии");
    expect(element.querySelector("a.card__cta")?.getAttribute("href")).toBe("/office/vacancies/7");
    expect(element.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-23T12:00:00Z");

    fixture.componentRef.setInput("feedItem", {
      ...fixture.componentInstance.feedItem(),
      requiredSkills: ["QA", "Postman", "API", "SQL", "Git", "Аналитика"].map((name, id) => ({
        id,
        name,
      })),
    });
    fixture.detectChanges();
    expect(
      Array.from(element.querySelectorAll(".card__skills li")).map(node =>
        node.textContent?.trim(),
      ),
    ).toEqual(["QA", "Postman", "API", "+3"]);
    expect(element.querySelector(".card__skills li:last-child")?.getAttribute("aria-label")).toBe(
      "Ещё навыков: 3",
    );
    expect(fixture.componentInstance.feedItem().requiredSkills).toHaveLength(6);
  });
});
