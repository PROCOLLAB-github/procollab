/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetVacancyDetailUseCase } from "./get-vacancy-detail.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("GetVacancyDetailUseCase", () => {
  let useCase: GetVacancyDetailUseCase;
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", ["getOne"]);
    TestBed.configureTestingModule({
      providers: [GetVacancyDetailUseCase, { provide: VacancyRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetVacancyDetailUseCase);
  }

  it("делегирует vacancyId в репозиторий", () => {
    setup();
    repo.getOne.and.returnValue(of({} as Vacancy));

    useCase.execute(42).subscribe();

    expect(repo.getOne).toHaveBeenCalledOnceWith(42);
  });

  it("при успехе возвращает ok с вакансией", done => {
    setup();
    const vacancy = { id: 42 } as unknown as Vacancy;
    repo.getOne.and.returnValue(of(vacancy));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(vacancy);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_vacancy_detail_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getOne.and.returnValue(throwError(() => boom));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_vacancy_detail_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
