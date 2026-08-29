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

  it("показывает действие отклика только при canRespond", () => {
    const text = render(vacancy({ canRespond: true }));

    expect(text).toContain("откликнуться");
    expect(text).not.toContain("посмотреть отклики");
  });

  it.each([
    ["pending", "На рассмотрении", "gold"],
    ["accepted", "Отклик принят", "green"],
    ["rejected", "Отклик отклонён", "red"],
    [null, "Отклик отправлен", "gold"],
  ] as const)("показывает disabled applicant state %s", (responseStatus, label, color) => {
    const emitted = vi.fn();
    fixture.componentInstance.sendResponse.subscribe(emitted);
    const text = render(vacancy({ hasResponded: true, canRespond: true, responseStatus }));

    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(text).toContain(label);
    expect(text).not.toContain("откликнуться");
    expect(button.disabled).toBe(true);
    expect(button.classList).toContain(`button--${color}`);
    button.click();
    expect(emitted).not.toHaveBeenCalled();
  });

  it("показывает менеджеру просмотр откликов вместо отправки", () => {
    const text = render(vacancy({ canRespond: true, canManageResponses: true }));

    expect(text).toContain("посмотреть отклики");
    expect(text).not.toContain("откликнуться");
  });

  it("не показывает действие при всех false", () => {
    const text = render(
      vacancy({ hasResponded: false, canRespond: false, canManageResponses: false }),
    );

    expect(text).not.toContain("откликнуться");
    expect(text).not.toContain("отклик отправлен");
    expect(text).not.toContain("посмотреть отклики");
  });
});
