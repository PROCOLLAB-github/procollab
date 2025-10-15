/** @format */

import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ProjectService } from "@office/services/project.service";

@Injectable({
  providedIn: "root",
})
export class ProjectsService {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  addProject(): void {
    this.projectService.create().subscribe(project => {
      this.projectService.projectsCount.next({
        ...this.projectService.projectsCount.getValue(),
        my: this.projectService.projectsCount.getValue().my + 1,
      });

      this.router
        .navigateByUrl(`/office/projects/${project.id}/edit?editingStep=main`)
        .then(() => console.debug("Route change from ProjectsComponent"));
    });
  }
}
