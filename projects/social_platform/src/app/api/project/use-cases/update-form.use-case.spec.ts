/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateFormUseCase } from "./update-form.use-case";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";
import { UpdateFormCommand } from "@domain/project/commands/update-form.command";

describe("UpdateFormUseCase", () => {
  let useCase: UpdateFormUseCase;
  let repo: any;

  function setup(): void {
    repo = { update: vi.fn() };
    TestBed.configureTestingModule({
      providers: [UpdateFormUseCase, { provide: ProjectRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(UpdateFormUseCase);
  }

  const cmd: UpdateFormCommand = { id: 1, data: {} as UpdateFormCommand["data"] };

  it("делегирует (id, data) в update", () => {
    setup();
    repo.update.mockReturnValue(of({} as Project));

    useCase.execute(cmd).subscribe();

    expect(repo.update).toHaveBeenCalledExactlyOnceWith(cmd.id, cmd.data);
  });

  it("при успехе возвращает ok с проектом", () =>
    new Promise<void>(done => {
      setup();
      const project = {} as Project;
      repo.update.mockReturnValue(of(project));

      useCase.execute(cmd).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(project);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'unknown' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.update.mockReturnValue(throwError(() => err));

      useCase.execute(cmd).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok && result.error.kind === "unknown") {
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
