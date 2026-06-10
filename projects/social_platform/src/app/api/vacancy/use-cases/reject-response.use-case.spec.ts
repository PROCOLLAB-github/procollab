/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { RejectResponseUseCase } from "./reject-response.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("RejectResponseUseCase", () => {
  let useCase: RejectResponseUseCase;
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { rejectResponse: vi.fn(), getOne: vi.fn() };
    eventBus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        RejectResponseUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(RejectResponseUseCase);
  }

  const fakeResponse = { id: 1, vacancy: 10, user: { id: 20 } } as unknown as VacancyResponse;
  const fakeVacancy = { id: 10, project: { id: 30 } } as unknown as Vacancy;

  it("делегирует responseId, получает вакансию и эмитит событие", () =>
    new Promise<void>(done => {
      setup();
      repo.rejectResponse.mockReturnValue(of(fakeResponse));
      repo.getOne.mockReturnValue(of(fakeVacancy));

      useCase.execute(1).subscribe(() => {
        expect(repo.rejectResponse).toHaveBeenCalledExactlyOnceWith(1);
        expect(repo.getOne).toHaveBeenCalledExactlyOnceWith(10);
        expect(eventBus.emit).toHaveBeenCalledTimes(1);
        done();
      });
    }));

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.rejectResponse.mockReturnValue(of(fakeResponse));
      repo.getOne.mockReturnValue(of(fakeVacancy));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'reject_response_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.rejectResponse.mockReturnValue(throwError(() => boom));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("reject_response_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
