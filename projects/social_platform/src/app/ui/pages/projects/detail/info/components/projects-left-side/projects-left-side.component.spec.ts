/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ProjectsLeftSideComponent } from "./projects-left-side.component";

describe("ProjectsLeftSideComponent", () => {
  let fixture: ComponentFixture<ProjectsLeftSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsLeftSideComponent],
      providers: [
        provideRouter([]),
        {
          provide: IndustryRepositoryPort,
          useValue: {
            getOne: () => ({ id: 1, name: "Информационные технологии" }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsLeftSideComponent);
    fixture.componentRef.setInput("project", {
      industry: 1,
      region: "Очень длинный регион проекта без обрезания",
      trl: "0",
      implementationDeadline: "",
      leader: 42,
      leaderInfo: { firstName: "Иван", lastName: "Иванов" },
    });
    fixture.detectChanges();
  });

  it("should show explicit project metadata labels", () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain("основное");
    expect(text).toContain("Сфера");
    expect(text).toContain("Регион");
    expect(text).toContain("TRL");
    expect(text).toContain("Срок реализации");
    expect(text).toContain("Лидер");
  });

  it("should use unified empty value and not show TRL 0 as real value", () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain("Не указан");
    expect(text).toContain("Иванов Иван");
    expect(text).not.toContain(">0<");
  });
});
