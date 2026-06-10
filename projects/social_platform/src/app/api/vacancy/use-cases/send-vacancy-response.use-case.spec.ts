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
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { sendResponse: vi.fn(), getOne: vi.fn() };
    eventBus = { emit: vi.fn() };
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

  it("делегирует vacancyId и body, получает вакансию и эмитит событие", () =>
    new Promise<void>(done => {
      setup();
      repo.sendResponse.mockReturnValue(of(fakeResponse));
      repo.getOne.mockReturnValue(of(fakeVacancy));

      useCase.execute(10, { whyMe: "test" }).subscribe(() => {
        expect(repo.sendResponse).toHaveBeenCalledExactlyOnceWith(10, { whyMe: "test" });
        expect(repo.getOne).toHaveBeenCalledExactlyOnceWith(10);
        expect(eventBus.emit).toHaveBeenCalledTimes(1);
        done();
      });
    }));

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.sendResponse.mockReturnValue(of(fakeResponse));
      repo.getOne.mockReturnValue(of(fakeVacancy));

      useCase.execute(10, { whyMe: "test" }).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'send_vacancy_response_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.sendResponse.mockReturnValue(throwError(() => boom));

      useCase.execute(10, { whyMe: "test" }).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("send_vacancy_response_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
