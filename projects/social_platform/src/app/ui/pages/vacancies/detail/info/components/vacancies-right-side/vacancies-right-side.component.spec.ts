/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Project } from "@domain/project/project.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacanciesRightSideComponent } from "./vacancies-right-side.component";

describe("VacanciesRightSideComponent", () => {
  let fixture: ComponentFixture<VacanciesRightSideComponent>;

  const vacancy = (overrides: Partial<Vacancy> = {}): Vacancy => {
    const project = Project.default();
    project.id = 5;
    project.name = "Проект";
    project.region = "Регион проекта не является городом вакансии";
    project.links = [];

    return Object.assign(new Vacancy(), {
      id: 10,
      project,
      city: "Москва",
      workFormat: "работа в офисе",
      requiredExperience: "без опыта",
      workSchedule: "частичная занятость",
      salary: "5555",
      ...overrides,
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacanciesRightSideComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VacanciesRightSideComponent);
  });

  function render(item: Vacancy): string {
    fixture.componentRef.setInput("vacancy", item);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? "";
  }

  it("показывает подписи метаданных и использует vacancy.city", () => {
    const text = render(vacancy());

    expect(text).toContain("Город");
    expect(text).toContain("Формат работы");
    expect(text).toContain("Опыт");
    expect(text).toContain("График");
    expect(text).toContain("Зарплата");
    expect(text).toContain("Москва");
    expect(text).not.toContain("Регион проекта не является городом вакансии");
    expect(text).toMatch(/5\s555 рублей/);
  });

  it("показывает безопасные значения для отсутствующих метаданных", () => {
    const text = render(
      vacancy({
        city: null,
        workFormat: "",
        requiredExperience: "",
        workSchedule: "",
        salary: "",
      }),
    );

    expect(text.match(/Не указан/g)).toHaveLength(4);
    expect(text).toContain("По договоренности");
  });
});
