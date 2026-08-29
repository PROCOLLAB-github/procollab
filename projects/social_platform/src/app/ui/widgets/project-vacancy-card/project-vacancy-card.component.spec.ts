/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjectVacancyCardComponent } from "./project-vacancy-card.component";
import { provideRouter } from "@angular/router";

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
});
