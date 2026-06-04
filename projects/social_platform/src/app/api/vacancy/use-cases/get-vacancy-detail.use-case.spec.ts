/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetVacancyDetailUseCase } from "./get-vacancy-detail.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("GetVacancyDetailUseCase", () => {
  let useCase: GetVacancyDetailUseCase;
  let repo: any;

  function setup(): void {
    repo = { getOne: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetVacancyDetailUseCase, { provide: VacancyRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetVacancyDetailUseCase);
  }

  it("делегирует vacancyId в репозиторий", () => {
    setup();
    repo.getOne.mockReturnValue(of({} as Vacancy));

    useCase.execute(42).subscribe();

    expect(repo.getOne).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("при успехе возвращает ok с вакансией", () =>
    new Promise<void>(done => {
      setup();
      const vacancy = { id: 42 } as unknown as Vacancy;
      repo.getOne.mockReturnValue(of(vacancy));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(vacancy);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_vacancy_detail_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.getOne.mockReturnValue(throwError(() => boom));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_vacancy_detail_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
