/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetProjectResponsesUseCase } from "./get-project-responses.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";

describe("GetProjectResponsesUseCase", () => {
  let useCase: GetProjectResponsesUseCase;
  let repo: any;

  function setup(): void {
    repo = { responsesByProject: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetProjectResponsesUseCase, { provide: VacancyRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetProjectResponsesUseCase);
  }

  it("делегирует projectId в репозиторий", () => {
    setup();
    repo.responsesByProject.mockReturnValue(of([]));

    useCase.execute(42).subscribe();

    expect(repo.responsesByProject).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("при успехе возвращает ok со списком откликов", () =>
    new Promise<void>(done => {
      setup();
      const responses = [{ id: 1 }] as unknown as VacancyResponse[];
      repo.responsesByProject.mockReturnValue(of(responses));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(responses);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_project_responses_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.responsesByProject.mockReturnValue(throwError(() => boom));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_project_responses_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
