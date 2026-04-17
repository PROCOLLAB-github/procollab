/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AcceptResponseUseCase } from "./accept-response.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("AcceptResponseUseCase", () => {
  let useCase: AcceptResponseUseCase;
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", [
      "acceptResponse",
      "getOne",
    ]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        AcceptResponseUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(AcceptResponseUseCase);
  }

  const fakeResponse = {
    id: 1,
    vacancy: 10,
    user: { id: 20 },
    role: "dev",
  } as unknown as VacancyResponse;
  const fakeVacancy = { id: 10, project: { id: 30 } } as unknown as Vacancy;

  it("делегирует responseId, получает вакансию и эмитит событие", done => {
    setup();
    repo.acceptResponse.and.returnValue(of(fakeResponse));
    repo.getOne.and.returnValue(of(fakeVacancy));

    useCase.execute(1).subscribe(() => {
      expect(repo.acceptResponse).toHaveBeenCalledOnceWith(1);
      expect(repo.getOne).toHaveBeenCalledOnceWith(10);
      expect(eventBus.emit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.acceptResponse.and.returnValue(of(fakeResponse));
    repo.getOne.and.returnValue(of(fakeVacancy));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'accept_response_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.acceptResponse.and.returnValue(throwError(() => boom));

    useCase.execute(1).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("accept_response_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
