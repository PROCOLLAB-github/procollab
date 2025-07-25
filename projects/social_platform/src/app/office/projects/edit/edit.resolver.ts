/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { forkJoin } from "rxjs";
import { ProjectService } from "@services/project.service";
import { Project } from "@models/project.model";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";

export const ProjectEditResolver: ResolveFn<[Project, Invite[]]> = (
  route: ActivatedRouteSnapshot
) => {
  const projectService = inject(ProjectService);
  const inviteService = inject(InviteService);

  const projectId = Number(route.paramMap.get("projectId"));

  return forkJoin<[Project, Invite[]]>([
    projectService.getOne(projectId),
    inviteService.getByProject(projectId),
  ]);
};
