/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { map, of, switchMap } from "rxjs";
import { ProjectSubscriber } from "@domain/project/project-subscriber.model";
import { Project } from "@domain/project/project.model";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";
import { GetProjectSubscribersUseCase } from "@api/project/use-cases/get-project-subscribers.use-case";

/** Предзагружает данные проекта и его подписчиков. */
export const ProjectDetailResolver: ResolveFn<[Project, ProjectSubscriber[]]> = (
  route: ActivatedRouteSnapshot,
) => {
  const getProjectUseCase = inject(GetProjectUseCase);
  const getProjectSubscribersUseCase = inject(GetProjectSubscribersUseCase);
  const projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  return getProjectUseCase.execute(Number(route.paramMap.get("projectId"))).pipe(
    switchMap(result => {
      if (!result.ok) {
        return of([new Project(), []] as [Project, ProjectSubscriber[]]);
      }

      const project = result.value;
      const leaderInfo = project.collaborators.find(
        collaborator => collaborator.userId === project.leader,
      ) as Project["leaderInfo"];
      projectsDetailUIInfoService.applySetProject({
        ...project,
        leaderInfo: { firstName: leaderInfo!.firstName, lastName: leaderInfo!.lastName },
      });

      return getProjectSubscribersUseCase
        .execute(project.id)
        .pipe(
          map(
            subscribersResult =>
              [project, subscribersResult.ok ? subscribersResult.value : []] as [
                Project,
                ProjectSubscriber[],
              ],
          ),
        );
    }),
  );
};
