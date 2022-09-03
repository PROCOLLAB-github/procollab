/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { ProjectService } from "../../services/project.service";
import { Project } from "../../models/project.model";

@Injectable({
  providedIn: "root",
})
export class ProjectDetailResolver implements Resolve<Project> {
  constructor(private projectService: ProjectService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Project> {
    return this.projectService.getOne(Number(route.paramMap.get("projectId")));
  }
}
