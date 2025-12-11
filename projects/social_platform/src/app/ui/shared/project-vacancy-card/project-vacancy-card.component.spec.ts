/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectVacancyCardComponent } from "./project-vacancy-card.component";

describe("ProjectVacancyCardComponent", () => {
  let component: ProjectVacancyCardComponent;
  let fixture: ComponentFixture<ProjectVacancyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectVacancyCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectVacancyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
