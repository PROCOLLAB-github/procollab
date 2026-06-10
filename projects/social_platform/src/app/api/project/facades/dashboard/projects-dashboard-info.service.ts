/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectsDashboardUIInfoService } from "./ui/projects-dashboard-ui-info.service";
import { CreateProjectUseCase } from "@api/project/use-cases/create-project.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { LoggerService } from "@core/public-api";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад дашборда проектов: список/подписки и создание проекта. */
@Injectable()
export class ProjectsDashboardInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loggerService = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);

  private readonly createProjectUseCase = inject(CreateProjectUseCase);

  initializationDashboardItems(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data: { all, my, subs } }) => {
        this.projectsDashboardUIInfoService.applySetDashboardItems(all, my, subs);
      },
    });
  }

  addProject(): void {
    this.createProjectUseCase.execute().subscribe({
      next: result => {
        if (!result.ok) return;

        this.router
          .navigate([AppRoutes.projects.edit(result.value.id)], {
            queryParams: { editingStep: "main" },
          })
          .then(() => this.loggerService.debug("Route change from ProjectsComponent"));
      },
    });
  }
}
