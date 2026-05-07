/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { UpdateVacancyUseCase } from "./update-vacancy.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("UpdateVacancyUseCase", () => {
  let useCase: UpdateVacancyUseCase;
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", ["updateVacancy"]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        UpdateVacancyUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(UpdateVacancyUseCase);
  }

  it("делегирует vacancyId и данные в репозиторий и эмитит событие", done => {
    setup();
    const patch: Partial<Vacancy> = { title: "Updated" } as Partial<Vacancy>;
    repo.updateVacancy.and.returnValue(of({ id: 1 } as unknown as Vacancy));

    useCase.execute(1, patch).subscribe(() => {
      expect(repo.updateVacancy).toHaveBeenCalledOnceWith(1, patch);
      expect(eventBus.emit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("при успехе возвращает ok с обновлённой вакансией", done => {
    setup();
    const vacancy = { id: 1 } as unknown as Vacancy;
    repo.updateVacancy.and.returnValue(of(vacancy));

    useCase.execute(1, {} as Partial<Vacancy>).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(vacancy);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'update_vacancy_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.updateVacancy.and.returnValue(throwError(() => boom));

    useCase.execute(1, {} as Partial<Vacancy>).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("update_vacancy_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
