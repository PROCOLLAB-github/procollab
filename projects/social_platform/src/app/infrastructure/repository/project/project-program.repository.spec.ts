/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProjectProgramRepository } from "./project-program.repository";
import { ProjectProgramHttpAdapter } from "../../adapters/project/project-program-http.adapter";
import { ProjectAssign } from "@domain/project/project-assign.model";
import { ProgramLinkField, ProgramLinkFields } from "@domain/project/program-link-fields.model";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { ProjectNewAdditionalProgramFields } from "@domain/program/partner-program-fields.model";

describe("ProjectProgramRepository", () => {
  let repository: ProjectProgramRepository;
  let adapter: any;

  function setup(): void {
    adapter = {
      assignProjectToProgram: vi.fn(),
      getProgramLinkFields: vi.fn(),
      updateProgramLinkFields: vi.fn(),
    };
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

  it("GET maps the canonical snapshot and nullable help text", () => {
    setup();
    const dto = programLinkFields();
    adapter.getProgramLinkFields.mockReturnValue(
      of({ ...dto, fields: [{ ...dto.fields[0], helpText: null }] }),
    );
    repository.getProgramLinkFields(700).subscribe(snapshot => {
      expect(snapshot).toBeInstanceOf(ProgramLinkFields);
      expect(snapshot.fields[0]).toBeInstanceOf(ProgramLinkField);
      expect(snapshot.fields[0].helpText).toBe("");
      expect(snapshot.fields[0].value).toBeNull();
      expect(snapshot.projectId).toBe(55);
    });
    expect(adapter.getProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700);
  });

  it("PUT delegates canonical relation ID without interpreting acknowledgement as Project", () =>
    new Promise<void>(done => {
      setup();
      const values = [] as ProjectNewAdditionalProgramFields[];
      adapter.updateProgramLinkFields.mockReturnValue(of(undefined));

      repository.updateProgramLinkFields(700, values).subscribe(res => {
        expect(adapter.updateProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700, values);
        expect(res).toBeUndefined();
        done();
      });
    }));
});
