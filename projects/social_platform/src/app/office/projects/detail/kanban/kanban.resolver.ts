/** @format */

import { inject } from "@angular/core";
import { KanbanBoardService } from "./services/kanban-board.service";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";

export const KanbanBoardResolver = (route: ActivatedRouteSnapshot): any => {
  const kanbanBoardService = inject(KanbanBoardService);
  const router = inject(Router);

  const projectId = Number(route.parent?.params["projectId"]);
  if (!projectId) {
    return of(router.createUrlTree(["/projects"]));
  }

  // return kanbanBoardService.getBoardByProjectId(projectId).pipe(
  //   map((board: any) => ({
  //     columns: board.columns,
  //   })),
  //   catchError((error) => {
  //     console.error('Error resolving Kanban board:', error);
  //     return of(router.createUrlTree(['/projects']));
  //   })
  // );
};
