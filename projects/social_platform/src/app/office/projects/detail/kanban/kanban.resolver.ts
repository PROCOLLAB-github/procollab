/** @format */

import { inject } from "@angular/core";
import { KanbanBoardService } from "./services/kanban-board.service";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";

export const KanbanBoardResolver = (route: ActivatedRouteSnapshot): any => {
  const kanbanBoardService = inject(KanbanBoardService);
  const router = inject(Router);

  const projectId = Number(route.parent?.params["projectId"]);
  if (!projectId) return of(router.createUrlTree(["/projects"]));

  return kanbanBoardService.getBoardByProjectId(projectId).pipe(
    map((board: any) => {
      const kanbanId = board[0].id;
      if (!kanbanId) return router.createUrlTree(["/projects", projectId, "work-section"]);

      return router.createUrlTree(["/projects", projectId, "kanban", kanbanId]);
    }),
    catchError(() => of(router.createUrlTree(["/projects"])))
  );
};
