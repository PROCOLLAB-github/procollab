/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { PostVacancyUseCase } from "./post-vacancy.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { CreateVacancyDto } from "../../project/dto/create-vacancy.model";

describe("PostVacancyUseCase", () => {
  let useCase: PostVacancyUseCase;
  let repo: jasmine.SpyObj<VacancyRepositoryPort>;
  let eventBus: jasmine.SpyObj<EventBus>;

  function setup(): void {
    repo = jasmine.createSpyObj<VacancyRepositoryPort>("VacancyRepositoryPort", ["postVacancy"]);
    eventBus = jasmine.createSpyObj<EventBus>("EventBus", ["emit"]);
    TestBed.configureTestingModule({
      providers: [
        PostVacancyUseCase,
        { provide: VacancyRepositoryPort, useValue: repo },
        { provide: EventBus, useValue: eventBus },
      ],
    });
    useCase = TestBed.inject(PostVacancyUseCase);
  }

  const dto = { title: "Dev" } as unknown as CreateVacancyDto;

  it("делегирует projectId и dto в репозиторий и эмитит событие", done => {
    setup();
    repo.postVacancy.and.returnValue(of({ id: 1 } as unknown as Vacancy));

    useCase.execute(5, dto).subscribe(() => {
      expect(repo.postVacancy).toHaveBeenCalledOnceWith(5, dto);
      expect(eventBus.emit).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("при успехе возвращает ok с созданной вакансией", done => {
    setup();
    const vacancy = { id: 1 } as unknown as Vacancy;
    repo.postVacancy.and.returnValue(of(vacancy));

    useCase.execute(5, dto).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(vacancy);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'post_vacancy_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.postVacancy.and.returnValue(throwError(() => boom));

    useCase.execute(5, dto).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("post_vacancy_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
