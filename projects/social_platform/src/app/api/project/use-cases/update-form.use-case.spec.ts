/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateFormUseCase } from "./update-form.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";
import { UpdateFormCommand } from "@domain/project/commands/update-form.command";

describe("UpdateFormUseCase", () => {
  let useCase: UpdateFormUseCase;
  let repo: jasmine.SpyObj<ProjectRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<ProjectRepositoryPort>("ProjectRepositoryPort", ["update"]);
    TestBed.configureTestingModule({
      providers: [UpdateFormUseCase, { provide: ProjectRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(UpdateFormUseCase);
  }

  const cmd: UpdateFormCommand = { id: 1, data: {} as UpdateFormCommand["data"] };

  it("делегирует (id, data) в update", () => {
    setup();
    repo.update.and.returnValue(of({} as Project));

    useCase.execute(cmd).subscribe();

    expect(repo.update).toHaveBeenCalledOnceWith(cmd.id, cmd.data);
  });

  it("при успехе возвращает ok с проектом", done => {
    setup();
    const project = {} as Project;
    repo.update.and.returnValue(of(project));

    useCase.execute(cmd).subscribe(result => {
      expect(result.ok).toBeTrue();
      if (result.ok) expect(result.value).toBe(project);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'unknown' } с cause", done => {
    setup();
    const err = new Error("boom");
    repo.update.and.returnValue(throwError(() => err));

    useCase.execute(cmd).subscribe(result => {
      expect(result.ok).toBeFalse();
      if (!result.ok) {
        expect(result.error.kind).toBe("unknown");
        expect(result.error.cause).toBe(err);
      }
      done();
    });
  });
});
