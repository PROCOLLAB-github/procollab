/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin, Observable } from "rxjs";
import { ProjectService } from "@services/project.service";
import { Project } from "@models/project.model";
import { Vacancy } from "@models/vacancy.model";
import { VacancyService } from "@services/vacancy.service";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";

export const ProjectEditResolver: ResolveFn<[Project, Vacancy[], Invite[]]> = (
  route: ActivatedRouteSnapshot
): Observable<[Project, Vacancy[], Invite[]]> => {
  const projectService = inject(ProjectService);
  const vacancyService = inject(VacancyService);
  const inviteService = inject(InviteService);

  const projectId = Number(route.paramMap.get("projectId"));

  return forkJoin<[Project, Vacancy[], Invite[]]>([
    projectService.getOne(projectId),
    vacancyService.getForProject(projectId),
    inviteService.getByProject(projectId),
  ]);
};
