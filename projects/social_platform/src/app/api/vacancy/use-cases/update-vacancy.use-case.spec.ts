/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateVacancyUseCase } from "./update-vacancy.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("UpdateVacancyUseCase", () => {
  let useCase: UpdateVacancyUseCase;
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { updateVacancy: vi.fn() };
    eventBus = { emit: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        UpdateVacancyUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(UpdateVacancyUseCase);
  }

  it("делегирует vacancyId и данные в репозиторий и эмитит событие", () =>
    new Promise<void>(done => {
      setup();
      const patch: Partial<Vacancy> = { title: "Updated" } as Partial<Vacancy>;
      repo.updateVacancy.mockReturnValue(of({ id: 1 } as unknown as Vacancy));

      useCase.execute(1, patch).subscribe(() => {
        expect(repo.updateVacancy).toHaveBeenCalledExactlyOnceWith(1, patch);
        expect(eventBus.emit).toHaveBeenCalledTimes(1);
        done();
      });
    }));

  it("при успехе возвращает ok с обновлённой вакансией", () =>
    new Promise<void>(done => {
      setup();
      const vacancy = { id: 1 } as unknown as Vacancy;
      repo.updateVacancy.mockReturnValue(of(vacancy));

      useCase.execute(1, {} as Partial<Vacancy>).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(vacancy);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'update_vacancy_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.updateVacancy.mockReturnValue(throwError(() => boom));

      useCase.execute(1, {} as Partial<Vacancy>).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("update_vacancy_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
