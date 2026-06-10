/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetMyVacanciesUseCase } from "./get-my-vacancies.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";

describe("GetMyVacanciesUseCase", () => {
  let useCase: GetMyVacanciesUseCase;
  let repo: any;

  function setup(): void {
    repo = { getMyVacancies: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetMyVacanciesUseCase, { provide: VacancyRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetMyVacanciesUseCase);
  }

  it("делегирует limit и offset в репозиторий", () => {
    setup();
    repo.getMyVacancies.mockReturnValue(of([]));

    useCase.execute(10, 20).subscribe();

    expect(repo.getMyVacancies).toHaveBeenCalledExactlyOnceWith(10, 20);
  });

  it("при успехе возвращает ok со списком откликов", () =>
    new Promise<void>(done => {
      setup();
      const responses = [{ id: 1 }] as unknown as VacancyResponse[];
      repo.getMyVacancies.mockReturnValue(of(responses));

      useCase.execute(10, 0).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(responses);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_my_vacancies_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.getMyVacancies.mockReturnValue(throwError(() => boom));

      useCase.execute(10, 0).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_my_vacancies_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
