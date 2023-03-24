/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { forkJoin, Observable } from "rxjs";
import { ProjectService } from "@services/project.service";
import { Project } from "@models/project.model";
import { Vacancy } from "@models/vacancy.model";
import { VacancyService } from "@services/vacancy.service";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";

@Injectable({
  providedIn: "root",
})
export class ProjectEditResolver implements Resolve<[Project, Vacancy[], Invite[]]> {
  constructor(
    private readonly projectService: ProjectService,
    private readonly vacancyService: VacancyService,
    private readonly inviteService: InviteService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<[Project, Vacancy[], Invite[]]> {
    const projectId = Number(route.paramMap.get("projectId"));
    return forkJoin([
      this.projectService.getOne(projectId),
      this.vacancyService.getForProject(projectId),
      this.inviteService.getByProject(projectId),
    ]);
  }
}
