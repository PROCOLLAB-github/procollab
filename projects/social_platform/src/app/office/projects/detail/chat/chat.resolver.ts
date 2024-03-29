/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";

export const ProjectChatResolver: ResolveFn<Project> = (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);
  const id = Number(route.parent?.paramMap.get("projectId"));

  return projectService.getOne(id);
};
