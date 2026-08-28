/** @format */

import { TestBed } from "@angular/core/testing";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { of, throwError } from "rxjs";
import { GetVacancyResponsesUseCase } from "./get-vacancy-responses.use-case";

describe("GetVacancyResponsesUseCase", () => {
  let useCase: GetVacancyResponsesUseCase;
  let repository: { responsesByVacancy: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repository = { responsesByVacancy: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        GetVacancyResponsesUseCase,
        { provide: VacancyRepositoryPort, useValue: repository },
      ],
    });
    useCase = TestBed.inject(GetVacancyResponsesUseCase);
  });

  it("загружает отклики только выбранной вакансии", () =>
    new Promise<void>(done => {
      const responses = [{ id: 1 }] as VacancyResponse[];
      repository.responsesByVacancy.mockReturnValue(of(responses));

      useCase.execute(17).subscribe(result => {
        expect(repository.responsesByVacancy).toHaveBeenCalledExactlyOnceWith(17);
        expect(result).toEqual({ ok: true, value: responses });
        done();
      });
    }));

  it("возвращает контролируемую ошибку с исходной причиной", () =>
    new Promise<void>(done => {
      const cause = { status: 403 };
      repository.responsesByVacancy.mockReturnValue(throwError(() => cause));

      useCase.execute(17).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.cause).toBe(cause);
        done();
      });
    }));
});
