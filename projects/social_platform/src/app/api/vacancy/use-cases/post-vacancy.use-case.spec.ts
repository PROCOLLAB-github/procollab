/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { PostVacancyUseCase } from "./post-vacancy.use-case";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { CreateVacancyDto } from "../../../domain/vacancy/dto/create-vacancy.model";

describe("PostVacancyUseCase", () => {
  let useCase: PostVacancyUseCase;
  let repo: any;
  let eventBus: any;

  function setup(): void {
    repo = { postVacancy: vi.fn() };
    eventBus = { emit: vi.fn() };
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

  it("делегирует projectId и dto в репозиторий и эмитит событие", () =>
    new Promise<void>(done => {
      setup();
      repo.postVacancy.mockReturnValue(of({ id: 1 } as unknown as Vacancy));

      useCase.execute(5, dto).subscribe(() => {
        expect(repo.postVacancy).toHaveBeenCalledExactlyOnceWith(5, dto);
        expect(eventBus.emit).toHaveBeenCalledTimes(1);
        done();
      });
    }));

  it("при успехе возвращает ok с созданной вакансией", () =>
    new Promise<void>(done => {
      setup();
      const vacancy = { id: 1 } as unknown as Vacancy;
      repo.postVacancy.mockReturnValue(of(vacancy));

      useCase.execute(5, dto).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(vacancy);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'post_vacancy_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.postVacancy.mockReturnValue(throwError(() => boom));

      useCase.execute(5, dto).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("post_vacancy_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
