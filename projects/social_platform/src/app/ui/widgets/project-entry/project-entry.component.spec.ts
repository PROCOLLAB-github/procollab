/** @format */

import { OverlayContainer } from "@angular/cdk/overlay";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AssignProjectProgramUseCase } from "@api/program/use-cases/assign-project-program";
import { ApplyProjectToProgramUseCase } from "@api/program/use-cases/apply-project-to-program.use-case";
import { CreateProjectUseCase } from "@api/project/use-cases/create-project.use-case";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { ok } from "@domain/shared/result.type";
import { of } from "rxjs";
import { ProjectEntryComponent } from "./project-entry.component";

describe("ProjectEntryComponent", () => {
  let fixture: ComponentFixture<ProjectEntryComponent>;
  const getAll = vi.fn();
  const assign = vi.fn();

  beforeEach(async () => {
    getAll.mockReset();
    assign.mockReset();
    getAll.mockReturnValue(
      of({
        results: [
          { id: 88, name: "Project program" },
          { id: 89, name: "Another program" },
        ],
      }),
    );
    await TestBed.configureTestingModule({
      imports: [ProjectEntryComponent],
      providers: [
        provideRouter([]),
        { provide: ProgramRepositoryPort, useValue: { getAll } },
        { provide: ProjectRepositoryPort, useValue: {} },
        { provide: AssignProjectProgramUseCase, useValue: { execute: assign } },
        { provide: ApplyProjectToProgramUseCase, useValue: {} },
        { provide: CreateProjectUseCase, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectEntryComponent);
    fixture.componentRef.setInput("projectId", 414);
  });

  async function dialog(): Promise<HTMLElement> {
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    return TestBed.inject(OverlayContainer).getContainerElement();
  }

  it("lists submitted and draft copies separately from new submissions", async () => {
    fixture.componentRef.setInput("programCopies", [
      {
        projectId: 415,
        programId: 88,
        programLinkId: 214,
        name: "Project program",
        submitted: true,
      },
      {
        projectId: 416,
        programId: 87,
        programLinkId: 215,
        name: "Closed program",
        submitted: false,
      },
    ]);
    const overlay = await dialog();
    const copies = overlay.querySelectorAll(".project-entry__copies li");
    expect(copies[0].textContent).toContain("Проект сдан");
    expect(copies[0].querySelector("a")?.getAttribute("href")).toBe(
      "/office/projects/415?programLinkId=214",
    );
    expect(copies[1].textContent).toContain("Черновик");
    expect(copies[1].querySelector("a")?.getAttribute("href")).toBe(
      "/office/projects/416?programLinkId=215",
    );
    const choices = overlay.querySelectorAll("fieldset label");
    expect(choices).toHaveLength(1);
    expect(choices[0].textContent).toContain("Another program");
    fixture.componentInstance.selection.set(88);
    await fixture.componentInstance.submit();
    expect(assign).not.toHaveBeenCalled();
  });

  it.each([
    { canEdit: false, route: "/office/projects/415", queryParams: { programLinkId: 214 } },
    {
      canEdit: true,
      route: "/office/projects/415/edit",
      queryParams: { editingStep: "additional", programLinkId: 214 },
    },
  ])(
    "opens the appropriate view with canEdit=$canEdit",
    async ({ canEdit, route, queryParams }) => {
      assign.mockReturnValue(of(ok({ newProjectId: 415, programLinkId: 214, canEdit })));
      const navigate = vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
      await dialog();
      fixture.componentInstance.selection.set(88);

      await fixture.componentInstance.submit();

      expect(assign).toHaveBeenCalledExactlyOnceWith(414, 88);
      expect(navigate).toHaveBeenCalledExactlyOnceWith([route], { queryParams });
    },
  );
});
