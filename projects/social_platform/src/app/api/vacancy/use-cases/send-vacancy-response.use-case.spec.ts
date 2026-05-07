/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SendVacancyResponseUseCase } from "./send-vacancy-response.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("SendVacancyResponseUseCase", () => {
  let useCase: SendVacancyResponseUseCase;
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", [
      "sendResponse",
      "getOne",
    ]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        SendVacancyResponseUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(SendVacancyResponseUseCase);
  }

  const fakeResponse = {
    id: 1,
    vacancy: 10,
    user: { id: 20 },
    isApproved: false,
  } as unknown as VacancyResponse;
  const fakeVacancy = { id: 10, project: { id: 30 } } as unknown as Vacancy;

  it("делегирует vacancyId и body, получает вакансию и эмитит событие", done => {
    setup();
    repo.sendResponse.and.returnValue(of(fakeResponse));
    repo.getOne.and.returnValue(of(fakeVacancy));

    useCase.execute(10, { whyMe: "test" }).subscribe(() => {
      expect(repo.sendResponse).toHaveBeenCalledOnceWith(10, { whyMe: "test" });
      expect(repo.getOne).toHaveBeenCalledOnceWith(10);
      expect(eventBus.emit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.sendResponse.and.returnValue(of(fakeResponse));
    repo.getOne.and.returnValue(of(fakeVacancy));

    useCase.execute(10, { whyMe: "test" }).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'send_vacancy_response_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.sendResponse.and.returnValue(throwError(() => boom));

    useCase.execute(10, { whyMe: "test" }).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("send_vacancy_response_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
