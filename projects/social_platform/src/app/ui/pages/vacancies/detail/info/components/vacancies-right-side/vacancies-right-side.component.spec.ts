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

  function render(item: Vacancy): HTMLElement {
    fixture.componentRef.setInput("vacancy", item);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("показывает пять строк метаданных и использует vacancy.city", () => {
    const element = render(vacancy());
    const text = element.textContent ?? "";
    const labels = Array.from(element.querySelectorAll(".lists__label"), item =>
      item.textContent?.trim(),
    );

    expect(labels).toEqual(["Опыт", "График", "Формат работы", "Зарплата", "Город"]);
    expect(text).toContain("Москва");
    expect(text).not.toContain("Регион проекта не является городом вакансии");
    expect(text).toMatch(/5\s555 рублей/);
  });

  it("показывает безопасные значения для отсутствующих метаданных", () => {
    const text =
      render(
        vacancy({
          city: null,
          workFormat: "",
          requiredExperience: "",
          workSchedule: "",
          salary: "",
        }),
      ).textContent ?? "";

    expect(text.match(/Не указан/g)).toHaveLength(4);
    expect(text).toContain("По договоренности");
  });

  it("сохраняет полное длинное значение города без обрезки", () => {
    const city = "Очень длинное название города ".repeat(12).trim();
    const text = render(vacancy({ city })).textContent ?? "";

    expect(text).toContain(city);
  });

  it("показывает действие отклика только при canRespond", () => {
    const text = render(vacancy({ canRespond: true })).textContent ?? "";

    expect(text).toContain("откликнуться");
    expect(text).not.toContain("посмотреть отклики");
  });

  it("показывает disabled-состояние после отправки и не открывает форму", () => {
    const emitted = vi.fn();
    fixture.componentInstance.sendResponse.subscribe(emitted);
    render(vacancy({ hasResponded: true, canRespond: false }));

    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(button.textContent).toContain("отклик отправлен");
    expect(button.disabled).toBe(true);
    button.click();
    expect(emitted).not.toHaveBeenCalled();
  });

  it("показывает менеджеру просмотр откликов вместо отправки", () => {
    const text = render(vacancy({ canRespond: true, canManageResponses: true })).textContent ?? "";

    expect(text).toContain("посмотреть отклики");
    expect(text).not.toContain("откликнуться");
  });

  it("не показывает действие при всех false", () => {
    const text =
      render(vacancy({ hasResponded: false, canRespond: false, canManageResponses: false }))
        .textContent ?? "";

    expect(text).not.toContain("откликнуться");
    expect(text).not.toContain("отклик отправлен");
    expect(text).not.toContain("посмотреть отклики");
  });
});
