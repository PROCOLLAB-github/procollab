/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";

@Injectable({
  providedIn: "root",
})
export class ProjectChatResolver implements Resolve<Project> {
  constructor(private readonly projectService: ProjectService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Project> {
    const id = Number(route.parent?.paramMap.get("projectId"));

    return this.projectService.getOne(id);
  }
}
