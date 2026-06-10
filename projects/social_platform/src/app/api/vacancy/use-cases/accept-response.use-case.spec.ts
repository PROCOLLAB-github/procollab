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
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { acceptResponse: vi.fn(), getOne: vi.fn() };
    eventBus = { emit: vi.fn() };
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

  it("делегирует responseId, получает вакансию и эмитит событие", () =>
    new Promise<void>(done => {
      setup();
      repo.acceptResponse.mockReturnValue(of(fakeResponse));
      repo.getOne.mockReturnValue(of(fakeVacancy));

      useCase.execute(1).subscribe(() => {
        expect(repo.acceptResponse).toHaveBeenCalledExactlyOnceWith(1);
        expect(repo.getOne).toHaveBeenCalledExactlyOnceWith(10);
        expect(eventBus.emit).toHaveBeenCalledTimes(1);
        done();
      });
    }));

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.acceptResponse.mockReturnValue(of(fakeResponse));
      repo.getOne.mockReturnValue(of(fakeVacancy));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'accept_response_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.acceptResponse.mockReturnValue(throwError(() => boom));

      useCase.execute(1).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("accept_response_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
