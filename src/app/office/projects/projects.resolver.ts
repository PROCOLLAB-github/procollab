/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { ProjectCount } from "../models/project.model";
import { ProjectService } from "../services/project.service";

@Injectable({
  providedIn: "root",
})
export class ProjectsResolver implements Resolve<ProjectCount> {
  constructor(private projectService: ProjectService) {}

  resolve(): Observable<ProjectCount> {
    return this.projectService.getCount();
  }
}
