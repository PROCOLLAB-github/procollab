/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable, take, noop } from "rxjs";
import { ProjectCount } from "@models/project.model";
import { ProjectService } from "@services/project.service";
import { AuthService } from "@auth/services";

@Injectable({
  providedIn: "root",
})
export class ProjectsResolver implements Resolve<ProjectCount> {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService
  ) {}

  resolve(): Observable<ProjectCount> {
    this.authService.getProfile().pipe(take(1)).subscribe(noop);
    return this.projectService.getCount();
  }
}
