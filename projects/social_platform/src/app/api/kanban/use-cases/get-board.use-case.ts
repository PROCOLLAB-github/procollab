/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { KanbanRepositoryPort } from "../../../domain/kanban/ports/kanban.repository.port";
import { Board } from "../../../domain/kanban/board.model";

export type GetBoardError = { kind: "not_found" } | { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class GetBoardUseCase {
  private readonly kanbanRepository = inject(KanbanRepositoryPort);

  execute(projectId: number): Observable<Result<Board, GetBoardError>> {
    return this.kanbanRepository.getBoardByProjectId(projectId).pipe(
      map(board => ok<Board>(board)),
      catchError(error => {
        if (error.status === 404) {
          return of(fail<GetBoardError>({ kind: "not_found" }));
        }
        return of(fail<GetBoardError>({ kind: "server_error" }));
      })
    );
  }
}
