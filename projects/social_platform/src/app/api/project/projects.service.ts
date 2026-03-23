/** @format */

import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { CreateProjectUseCase } from "./use-case/create-project.use-case";

@Injectable({
  providedIn: "root",
})
export class ProjectsService {
  private readonly createProjectUseCase = inject(CreateProjectUseCase);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  addProject(): void {
    this.createProjectUseCase.execute().subscribe({
      next: result => {
        if (!result.ok) return;

        this.router
          .navigate([`/office/projects/${result.value.id}/edit`], {
            queryParams: { editingStep: "main" },
          })
          .then(() => this.logger.debug("Route change from ProjectsComponent"));
      },
    });
  }
}
