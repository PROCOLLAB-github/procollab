/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjectVacancyCardComponent } from "./project-vacancy-card.component";
import { provideRouter, RouterLink } from "@angular/router";
import { By } from "@angular/platform-browser";

describe("ProjectVacancyCardComponent", () => {
  let component: ProjectVacancyCardComponent;
  let fixture: ComponentFixture<ProjectVacancyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectVacancyCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectVacancyCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("vacancy", {
      id: 1,
      role: "Test Vacancy",
      description: "",
      requiredSkills: [],
      salary: "100000",
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("показывает длинное название вакансии целиком в двухстрочном контейнере", () => {
    const longRole = "Очень длинное название роли специалиста по развитию цифровых продуктов";
    fixture.componentRef.setInput("type", "vacancies");
    fixture.componentRef.setInput("vacancy", {
      id: 1,
      role: longRole,
      description: "",
      requiredSkills: [],
      salary: "100000",
      datetimeCreated: "2026-08-29T12:00:00Z",
      project: { name: "Проект", imageAddress: "" },
    });
    fixture.detectChanges();

    const role = fixture.nativeElement.querySelector(".vacancy__role") as HTMLElement;
    expect(role.textContent?.trim()).toBe(longRole);
  });

  it.each([
    [
      "leader",
      { canManageResponses: true, canRespond: false, hasResponded: false },
      "посмотреть отклики",
    ],
    [
      "outsider",
      { canManageResponses: false, canRespond: true, hasResponded: false },
      "откликнуться",
    ],
  ])("uses backend applicant flags for %s catalog action", (_, state, expectedAction) => {
    fixture.componentRef.setInput("type", "vacancies");
    fixture.componentRef.setInput("vacancy", {
      id: 7,
      role: "Frontend developer",
      description: "",
      requiredSkills: [],
      salary: "100000",
      datetimeCreated: "2026-08-29T12:00:00Z",
      project: { name: "Проект", imageAddress: "" },
      ...state,
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain("подробнее");
    expect(text).toContain(expectedAction);
  });

  it("uses manageResponses query parameter for the leader action", () => {
    fixture.componentRef.setInput("type", "vacancies");
    fixture.componentRef.setInput("vacancy", {
      id: 7,
      role: "Frontend developer",
      description: "",
      requiredSkills: [],
      salary: "100000",
      datetimeCreated: "2026-08-29T12:00:00Z",
      project: { name: "Проект", imageAddress: "" },
      canManageResponses: true,
      canRespond: false,
      hasResponded: false,
    });
    fixture.detectChanges();

    const managerLink = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .find(element => element.nativeElement.textContent.includes("посмотреть отклики"));
    const detailLink = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .find(element => element.nativeElement.textContent.includes("подробнее"));

    expect(managerLink?.injector.get(RouterLink).queryParams).toEqual({ manageResponses: true });
    expect(managerLink?.nativeElement.classList).toContain("vacancy__primary-action");
    expect(detailLink?.nativeElement.classList).toContain("vacancy__secondary-action");
    expect(fixture.nativeElement.querySelectorAll(".vacancy__actions app-button")).toHaveLength(2);
  });

  it("keeps the complete skill name in a dedicated readable tag", () => {
    const skillName = "Проектирование пользовательских интерфейсов";
    fixture.componentRef.setInput("vacancy", {
      id: 1,
      role: "Designer",
      description: "",
      requiredSkills: [{ id: 2, name: skillName, category: { name: "Hard skills" } }],
      salary: "100000",
    });
    fixture.detectChanges();

    const skill = fixture.nativeElement.querySelector(
      "app-tag.vacancy__skill--compact",
    ) as HTMLElement;
    expect(skill.textContent?.trim()).toBe(skillName);
  });

  it.each([
    ["collaborator", { canManageResponses: false, canRespond: false, hasResponded: false }],
    ["responded user", { canManageResponses: false, canRespond: false, hasResponded: true }],
  ])("shows only detail action for %s", (_, state) => {
    fixture.componentRef.setInput("type", "vacancies");
    fixture.componentRef.setInput("vacancy", {
      id: 7,
      role: "Frontend developer",
      description: "",
      requiredSkills: [],
      salary: "100000",
      datetimeCreated: "2026-08-29T12:00:00Z",
      project: { name: "Проект", imageAddress: "" },
      ...state,
    });
    fixture.detectChanges();

    const actions = Array.from(
      fixture.nativeElement.querySelectorAll(".vacancy__actions app-button"),
    ) as HTMLElement[];
    expect(actions).toHaveLength(1);
    expect(actions[0].textContent).toContain("подробнее");
  });

  it("keeps a long project title in the DOM without hard truncation", () => {
    const projectName = "Очень длинное название проекта без потери полного текста в DOM";
    fixture.componentRef.setInput("type", "vacancies");
    fixture.componentRef.setInput("vacancy", {
      id: 7,
      role: "Frontend developer",
      description: "",
      requiredSkills: [],
      salary: "100000",
      datetimeCreated: "2026-08-29T12:00:00Z",
      project: { name: projectName, imageAddress: "" },
      canRespond: false,
      canManageResponses: false,
      hasResponded: false,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".vacancy__project-name").textContent.trim()).toBe(
      projectName,
    );
  });

  it("keeps the project avatar at 40 by 40 when project and role text are long", () => {
    fixture.componentRef.setInput("type", "vacancies");
    fixture.componentRef.setInput("vacancy", {
      id: 7,
      role: "Очень длинная роль специалиста по развитию международных цифровых проектов",
      description: "",
      requiredSkills: [],
      salary: "100000",
      datetimeCreated: "2026-08-29T12:00:00Z",
      project: {
        name: "Очень длинное название проекта для проверки неизменного размера аватара",
        imageAddress: "",
      },
      canRespond: false,
      canManageResponses: false,
      hasResponded: false,
    });
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector(
      "app-avatar.vacancy__project-avatar",
    ) as HTMLElement;
    const image = avatar.querySelector("img") as HTMLImageElement;

    expect(avatar.classList).toContain("vacancy__project-avatar");
    expect(image.style.width).toBe("40px");
    expect(image.style.height).toBe("40px");
  });
});
