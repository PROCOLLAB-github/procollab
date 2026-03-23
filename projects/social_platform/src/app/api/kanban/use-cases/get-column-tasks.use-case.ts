/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { KanbanRepositoryPort } from "../../../domain/kanban/ports/kanban.repository.port";
import { Column } from "../../../domain/kanban/column.model";

export type GetColumnTasksError = { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class GetColumnTasksUseCase {
  private readonly kanbanRepository = inject(KanbanRepositoryPort);

  execute(columnId: number): Observable<Result<Column, GetColumnTasksError>> {
    return this.kanbanRepository.getTasksByColumnId(columnId).pipe(
      map(column => ok<Column>(column)),
      catchError(() => of(fail<GetColumnTasksError>({ kind: "server_error" })))
    );
  }
}
