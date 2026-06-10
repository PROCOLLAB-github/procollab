/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { SubmitTaskAnswerUseCase } from "./submit-task-answer.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { TaskAnswerResponse } from "@domain/courses/courses.model";

describe("SubmitTaskAnswerUseCase", () => {
  let useCase: SubmitTaskAnswerUseCase;
  let repo: any;

  function setup(): void {
    repo = { postAnswerQuestion: vi.fn() };
    TestBed.configureTestingModule({
      providers: [SubmitTaskAnswerUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(SubmitTaskAnswerUseCase);
  }

  it("делегирует аргументы в репозиторий", () => {
    setup();
    repo.postAnswerQuestion.mockReturnValue(of({} as TaskAnswerResponse));

    useCase.execute(7, "ответ", [1, 2], [3]).subscribe();

    expect(repo.postAnswerQuestion).toHaveBeenCalledExactlyOnceWith(7, "ответ", [1, 2], [3]);
  });

  it("при успехе возвращает ok с ответом", () =>
    new Promise<void>(done => {
      setup();
      const response = { id: 1 } as unknown as TaskAnswerResponse;
      repo.postAnswerQuestion.mockReturnValue(of(response));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(response);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'submit_answer_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.postAnswerQuestion.mockReturnValue(throwError(() => boom));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("submit_answer_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
