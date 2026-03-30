/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { TaskAnswerResponse } from "@domain/courses/courses.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class SubmitTaskAnswerUseCase {
  private readonly coursesRepository = inject(CoursesRepositoryPort);

  execute(
    taskId: number,
    answerText?: any,
    optionIds?: number[],
    fileIds?: number[]
  ): Observable<Result<TaskAnswerResponse, { kind: "submit_answer_error"; cause?: unknown }>> {
    return this.coursesRepository.postAnswerQuestion(taskId, answerText, optionIds, fileIds).pipe(
      map(response => ok<TaskAnswerResponse>(response)),
      catchError(error => of(fail({ kind: "submit_answer_error" as const, cause: error })))
    );
  }
}
