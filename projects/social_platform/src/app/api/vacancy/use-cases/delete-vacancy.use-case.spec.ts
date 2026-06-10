/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteVacancyUseCase } from "./delete-vacancy.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";

describe("DeleteVacancyUseCase", () => {
  let useCase: DeleteVacancyUseCase;
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { deleteVacancy: vi.fn() };
    eventBus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        DeleteVacancyUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(DeleteVacancyUseCase);
  }

  it("делегирует vacancyId и эмитит событие", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteVacancy.mockReturnValue(of(undefined));

      useCase.execute(42).subscribe(() => {
        expect(repo.deleteVacancy).toHaveBeenCalledExactlyOnceWith(42);
        expect(eventBus.emit).toHaveBeenCalledTimes(1);
        done();
      });
    }));

  it("при успехе возвращает ok<void>", () =>
    new Promise<void>(done => {
      setup();
      repo.deleteVacancy.mockReturnValue(of(undefined));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(true);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'delete_vacancy_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.deleteVacancy.mockReturnValue(throwError(() => boom));

      useCase.execute(42).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("delete_vacancy_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
