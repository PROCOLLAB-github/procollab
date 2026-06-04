/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectGoalsUseCase } from "./get-project-goals.use-case";
import { ProjectGoalsRepositoryPort } from "@domain/project/ports/project-goals.repository.port";
import { Goal } from "@domain/project/goals.model";

describe("GetProjectGoalsUseCase", () => {
  let useCase: GetProjectGoalsUseCase;
  let repo: any;

  function setup(): void {
    repo = { fetchAll: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProjectGoalsUseCase, { provide: ProjectGoalsRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectGoalsUseCase);
  }

  it("делегирует projectId в fetchAll", () => {
    setup();
    repo.fetchAll.mockReturnValue(of([]));

    useCase.execute(1).subscribe();

    expect(repo.fetchAll).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("при успехе возвращает ok с массивом целей", () =>
    new Promise<void>(done => {
      setup();
      const goals: Goal[] = [];
      repo.fetchAll.mockReturnValue(of(goals));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(goals);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_goals_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const err = new Error("boom");
      repo.fetchAll.mockReturnValue(throwError(() => err));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_goals_error");
          expect(result.error.cause).toBe(err);
        }
        done();
      });
    }));
});
