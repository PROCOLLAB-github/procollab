/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetVacanciesUseCase, GetVacanciesParams } from "./get-vacancies.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("GetVacanciesUseCase", () => {
  let useCase: GetVacanciesUseCase;
  let repo: any;

  function setup(): void {
    repo = { getForProject: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetVacanciesUseCase, { provide: VacancyRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetVacanciesUseCase);
  }

  it("делегирует все параметры в репозиторий", () => {
    setup();
    repo.getForProject.mockReturnValue(of([]));
    const params: GetVacanciesParams = {
      limit: 10,
      offset: 0,
      projectId: 1,
      requiredExperience: "mid",
      workFormat: "remote",
      workSchedule: "full-time",
      salary: "100000",
      searchValue: "dev",
    };

    useCase.execute(params).subscribe();

    expect(repo.getForProject).toHaveBeenCalledExactlyOnceWith(
      10,
      0,
      1,
      "mid",
      "remote",
      "full-time",
      "100000",
      "dev",
    );
  });

  it("при успехе возвращает ok со списком вакансий", () =>
    new Promise<void>(done => {
      setup();
      const vacancies = [{ id: 1 }] as unknown as Vacancy[];
      repo.getForProject.mockReturnValue(of(vacancies));

      useCase.execute({ limit: 10, offset: 0 }).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(vacancies);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_vacancies_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.getForProject.mockReturnValue(throwError(() => boom));

      useCase.execute({ limit: 10, offset: 0 }).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_vacancies_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
