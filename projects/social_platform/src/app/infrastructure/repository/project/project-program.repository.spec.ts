/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectProgramRepository } from "./project-program.repository";
import { ProjectProgramHttpAdapter } from "../../adapters/project/project-program-http.adapter";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { Project } from "@domain/project/project.model";
import { ProjectDto } from "../../adapters/project/dto/project.dto";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";

describe("ProjectProgramRepository", () => {
  let repository: ProjectProgramRepository;
  let adapter: any;

  function setup(): void {
    adapter = { assignProjectToProgram: vi.fn(), sendNewProjectFieldsValues: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ProjectProgramRepository,
        { provide: ProjectProgramHttpAdapter, useValue: adapter },
      ],
    });
    repository = TestBed.inject(ProjectProgramRepository);
  }

  it("assignProjectToProgram мапит ответ в ProjectAssign", () =>
    new Promise<void>(done => {
      setup();
      adapter.assignProjectToProgram.mockReturnValue(of({} as ProjectAssign));

      repository.assignProjectToProgram(42, 5).subscribe(res => {
        expect(adapter.assignProjectToProgram).toHaveBeenCalledExactlyOnceWith(42, 5);
        expect(res).toBeInstanceOf(ProjectAssign);
        done();
      });
    }));

  it("sendNewProjectFieldsValues мапит ответ в Project", () =>
    new Promise<void>(done => {
      setup();
      const values = [] as ProjectNewAdditionalProgramFields[];
      adapter.sendNewProjectFieldsValues.mockReturnValue(of({ id: 1 } as ProjectDto));

      repository.sendNewProjectFieldsValues(42, values).subscribe(res => {
        expect(adapter.sendNewProjectFieldsValues).toHaveBeenCalledExactlyOnceWith(42, values);
        expect(res).toBeInstanceOf(Project);
        done();
      });
    }));
});
