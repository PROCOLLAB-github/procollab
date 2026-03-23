/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { KanbanRepositoryPort } from "../../../domain/kanban/ports/kanban.repository.port";
import { TaskDetail } from "../../../domain/kanban/task.model";

export type GetTaskError = { kind: "not_found" } | { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class GetTaskUseCase {
  private readonly kanbanRepository = inject(KanbanRepositoryPort);

  execute(taskId: number): Observable<Result<TaskDetail, GetTaskError>> {
    return this.kanbanRepository.getTaskById(taskId).pipe(
      map(task => ok<TaskDetail>(task)),
      catchError(error => {
        if (error.status === 404) {
          return of(fail<GetTaskError>({ kind: "not_found" }));
        }
        return of(fail<GetTaskError>({ kind: "server_error" }));
      })
    );
  }
}
