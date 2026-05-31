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
      name: "Test Vacancy",
      description: "",
      requiredSkills: [],
      salary: "100000",
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
