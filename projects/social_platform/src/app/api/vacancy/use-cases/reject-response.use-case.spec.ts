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
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", [
      "rejectResponse",
      "getOne",
    ]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
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

  it("делегирует responseId, получает вакансию и эмитит событие", done => {
    setup();
    repo.rejectResponse.and.returnValue(of(fakeResponse));
    repo.getOne.and.returnValue(of(fakeVacancy));

    useCase.execute(1).subscribe(() => {
      expect(repo.rejectResponse).toHaveBeenCalledOnceWith(1);
      expect(repo.getOne).toHaveBeenCalledOnceWith(10);
      expect(eventBus.emit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.rejectResponse.and.returnValue(of(fakeResponse));
    repo.getOne.and.returnValue(of(fakeVacancy));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'reject_response_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.rejectResponse.and.returnValue(throwError(() => boom));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("reject_response_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
