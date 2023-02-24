/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { Project } from "@models/project.model";
import { ProjectService } from "@services/project.service";

@Injectable({
  providedIn: "root",
})
export class ProjectsAllResolver implements Resolve<Project[]> {
  constructor(private projectService: ProjectService) {}

  resolve(): Observable<Project[]> {
    return this.projectService.getAll();
  }
}
