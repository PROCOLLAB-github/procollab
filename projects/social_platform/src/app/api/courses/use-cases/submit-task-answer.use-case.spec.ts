/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SubmitTaskAnswerUseCase } from "./submit-task-answer.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { TaskAnswerResponse } from "@domain/courses/courses.model";

describe("SubmitTaskAnswerUseCase", () => {
  let useCase: SubmitTaskAnswerUseCase;
  let repo: jasmine.SpyObj<CoursesRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<CoursesRepositoryPort>("CoursesRepositoryPort", [
      "postAnswerQuestion",
    ]);
    TestBed.configureTestingModule({
      providers: [SubmitTaskAnswerUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SubmitTaskAnswerUseCase);
  }

  it("делегирует аргументы в репозиторий", () => {
    setup();
    repo.postAnswerQuestion.and.returnValue(of({} as TaskAnswerResponse));

    useCase.execute(7, "ответ", [1, 2], [3]).subscribe();

    expect(repo.postAnswerQuestion).toHaveBeenCalledOnceWith(7, "ответ", [1, 2], [3]);
  });

  it("при успехе возвращает ok с ответом", done => {
    setup();
    const response = { id: 1 } as unknown as TaskAnswerResponse;
    repo.postAnswerQuestion.and.returnValue(of(response));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(response);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'submit_answer_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.postAnswerQuestion.and.returnValue(throwError(() => boom));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("submit_answer_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
