/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { VacancyResponsesComponent } from "./vacancy-responses.component";

describe("VacancyResponsesComponent", () => {
  let fixture: ComponentFixture<VacancyResponsesComponent>;

  const response = (isApproved: boolean | null): VacancyResponse =>
    Object.assign(new VacancyResponse(), {
      id: 7,
      vacancy: 10,
      whyMe: "Хочу присоединиться к проекту",
      isApproved,
      datetimeCreated: "2026-08-27T10:00:00Z",
      user: {
        id: 2,
        firstName: "Иван",
        lastName: "Иванов",
        avatar: null,
        specialization: { id: 3, name: "UX/UI дизайнер" },
        skills: [
          { id: 4, name: "Figma" },
          { id: 5, name: "UX Research" },
        ],
        aboutMe: "",
      },
    });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyResponsesComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(VacancyResponsesComponent);
  });

  function render(responses: VacancyResponse[] = []): HTMLElement {
    fixture.componentRef.setInput("responses", responses);
    fixture.componentRef.setInput("loading", false);
    fixture.componentRef.setInput("error", null);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("показывает два действия только для pending response", () => {
    const element = render([response(null)]);

    expect(element.textContent).toContain("Иван Иванов");
    expect(element.textContent).toContain("Figma");
    expect(element.textContent).toContain("принять");
    expect(element.textContent).toContain("отклонить");
  });

  it("показывает дату отклика в правой части header карточки", () => {
    const element = render([response(null)]);
    const header = element.querySelector(".response__candidate") as HTMLElement;
    const date = header.querySelector(".response__date") as HTMLElement;

    expect(date.textContent).toContain("Отклик от 27.08.2026");
    expect(element.querySelector(".response > .response__date")).toBeNull();
  });

  it("сохраняет полное длинное название навыка в читаемом chip", () => {
    const longSkill = "Проектирование сложных пользовательских сценариев";
    const item = response(null);
    item.user!.skills = [{ id: 9, name: longSkill }];
    const element = render([item]);

    expect(element.querySelector(".response__skill")?.textContent?.trim()).toBe(longSkill);
  });

  it.each([
    [true, "Принят"],
    [false, "Отклонён"],
  ] as const)("показывает обработанный статус %s без действий", (status, label) => {
    const element = render([response(status)]);

    expect(element.textContent).toContain(label);
    expect(element.textContent).not.toContain("принять");
    expect(element.textContent).not.toContain("отклонить");
  });

  it("показывает empty state", () => {
    expect(render().textContent).toContain("На эту вакансию пока нет откликов");
  });

  it("показывает loading state", () => {
    fixture.componentRef.setInput("responses", []);
    fixture.componentRef.setInput("loading", true);
    fixture.componentRef.setInput("error", null);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Загрузка откликов");
  });

  it("показывает файл только при его наличии", () => {
    const withoutFile = render([response(null)]);
    expect(withoutFile.querySelector("a.response__file")).toBeNull();

    const withFile = response(null);
    withFile.accompanyingFile = {
      link: "https://example.test/cv.pdf",
      name: "resume.pdf",
      extension: "pdf",
      mimeType: "application/pdf",
      size: 1024,
    };
    const element = render([withFile]);
    const link = element.querySelector("a.response__file") as HTMLAnchorElement;
    expect(element.textContent).toContain("Приложенный файл:");
    expect(link.textContent).toContain("resume.pdf");
    expect(link.href).toBe("https://example.test/cv.pdf");
  });

  it("эмитит accept и decline с response id", () => {
    const accepted = vi.fn();
    const declined = vi.fn();
    fixture.componentInstance.accept.subscribe(accepted);
    fixture.componentInstance.decline.subscribe(declined);
    const element = render([response(null)]);
    const buttons = Array.from(element.querySelectorAll("button"));

    buttons.find(button => button.textContent?.includes("принять"))?.click();
    buttons.find(button => button.textContent?.includes("отклонить"))?.click();

    expect(accepted).toHaveBeenCalledExactlyOnceWith(7);
    expect(declined).toHaveBeenCalledExactlyOnceWith(7);
  });

  it.each([
    ["forbidden", "У вас нет доступа к откликам этой вакансии"],
    ["not_found", "Вакансия не найдена"],
    ["load_error", "Не удалось загрузить отклики"],
  ] as const)("показывает контролируемое состояние %s и retry", (error, message) => {
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);
    fixture.componentRef.setInput("responses", []);
    fixture.componentRef.setInput("loading", false);
    fixture.componentRef.setInput("error", error);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain(message);
    expect(element.textContent).toContain("Повторить");
    (element.querySelector("button") as HTMLButtonElement).click();
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
