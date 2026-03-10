/** @format */

import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { ProjectRepository } from "../../infrastructure/repository/project/project.repository";

@Injectable({
  providedIn: "root",
})
export class ProjectsService {
  private readonly projectRepository = inject(ProjectRepository);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  addProject(): void {
    this.projectRepository.postOne().subscribe(project => {
      this.projectRepository.count$.next({
        ...this.projectRepository.count$.getValue(),
        my: this.projectRepository.count$.getValue().my + 1,
      });

      this.router
        .navigate([`/office/projects/${project.id}/edit`], {
          queryParams: { editingStep: "main" },
        })
        .then(() => this.logger.debug("Route change from ProjectsComponent"));
    });
  }
}
