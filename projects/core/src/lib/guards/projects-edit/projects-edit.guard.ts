/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from "@angular/router";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

/**
 * Guard для ограничения доступа к редактированию проекта.
 *
 * Редактирование запрещается для проектов,
 * связанных с отправленной партнёрской программой.
 *
 * При:
 * - некорректном `projectId`;
 * - ошибке загрузки проекта;
 * - недоступности редактирования —
 * выполняется редирект на страницу просмотра проекта
 * или список пользовательских проектов.
 */
export const ProjectEditRequiredGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const projectRepository = inject(ProjectRepositoryPort);

  // Получение идентификатора проекта из параметров маршрута
  const projectId = Number(route.paramMap.get("projectId"));

  // Исключает выполнение запроса при некорректном идентификаторе проекта
  if (isNaN(projectId)) {
    return of(router.createUrlTree(["/office/projects/my"]));
  }

  // Проверка доступности редактирования проекта
  return projectRepository.getOne(projectId).pipe(
    map(project => {
      if (project.partnerProgram?.isSubmitted) {
        return router.createUrlTree([`/office/projects/${projectId}`]);
      }
      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree([`/office/projects/${projectId}`]));
    })
  );
};
