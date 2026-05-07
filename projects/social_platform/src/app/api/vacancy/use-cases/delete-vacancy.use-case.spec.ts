/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { DeleteVacancyUseCase } from "./delete-vacancy.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";

describe("DeleteVacancyUseCase", () => {
  let useCase: DeleteVacancyUseCase;
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", ["deleteVacancy"]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        DeleteVacancyUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(DeleteVacancyUseCase);
  }

  it("делегирует vacancyId и эмитит событие", done => {
    setup();
    repo.deleteVacancy.and.returnValue(of(undefined));

    useCase.execute(42).subscribe(() => {
      expect(repo.deleteVacancy).toHaveBeenCalledOnceWith(42);
      expect(eventBus.emit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("при успехе возвращает ok<void>", done => {
    setup();
    repo.deleteVacancy.and.returnValue(of(undefined));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(true);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'delete_vacancy_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.deleteVacancy.and.returnValue(throwError(() => boom));

    useCase.execute(42).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("delete_vacancy_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
