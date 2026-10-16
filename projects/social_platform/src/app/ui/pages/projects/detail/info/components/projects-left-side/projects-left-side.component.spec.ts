/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { DesktopLayoutService } from "@uilib";
import { provideRouter } from "@angular/router";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ProjectsLeftSideComponent } from "./projects-left-side.component";

describe("ProjectsLeftSideComponent", () => {
  let fixture: ComponentFixture<ProjectsLeftSideComponent>;
  const desktop = signal(false);

  beforeEach(async () => {
    desktop.set(false);
    await TestBed.configureTestingModule({
      imports: [ProjectsLeftSideComponent],
      providers: [
        { provide: DesktopLayoutService, useValue: { desktop } },
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

  it.each([true, false])("desktop=%s: полное имя и маршрут программы", isDesktop => {
    desktop.set(isDesktop);
    fixture.componentRef.setInput("project", {
      industry: 1,
      leader: 42,
      partnerProgram: {
        name: "Акселератор студенческих технологических проектов",
        programId: 12,
        programLinkId: 120,
      },
    });
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector(".lists__item--program");
    expect(field.textContent).toContain("Программа");
    expect(field.querySelector("a").textContent.trim()).toBe(
      "Акселератор студенческих технологических проектов",
    );
    expect(field.querySelector("a").getAttribute("href")).toBe("/office/program/12");
  });

  it.each([true, false])("desktop=%s: нет связи или отсутствует legacy имя", isDesktop => {
    desktop.set(isDesktop);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".lists__item--program")).toBeNull();
    fixture.componentRef.setInput("project", {
      industry: 1,
      leader: 42,
      partnerProgram: { programId: 12 },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".lists__item--program").textContent).toContain(
      "Название не указано",
    );
  });
});
