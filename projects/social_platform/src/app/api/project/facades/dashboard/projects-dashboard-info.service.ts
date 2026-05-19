/** @format */

import { inject, Injectable } from "@angular/core";
import { combineLatest, Subject, switchMap, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectsDashboardUIInfoService } from "./ui/projects-dashboard-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { GetProjectSubscriptionsUseCase } from "../../use-cases/get-project-subscriptions.use-case";
import { CreateProjectUseCase } from "@api/project/use-cases/create-project.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { LoggerService } from "@core/public-api";

/** Фасад дашборда проектов: список/подписки и создание проекта. */
@Injectable()
export class ProjectsDashboardInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly getProjectSubscriptionsUseCase = inject(GetProjectSubscriptionsUseCase);
  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);
  private readonly createProjectUseCase = inject(CreateProjectUseCase);

  private readonly destroy$ = new Subject<void>();

  initializationDashboardItems(): void {
    const subscriptions$ = this.authRepository.profile.pipe(
      switchMap(p => this.getProjectSubscriptionsUseCase.execute(p.id))
    );

    combineLatest([this.route.data, subscriptions$])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([
          {
            data: { all, my },
          },
          subs,
        ]) => {
          this.projectsDashboardUIInfoService.applySetDashboardItems(
            all,
            my,
            subs.ok ? subs.value : { count: 0, results: [], next: "", previous: "" }
          );
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
          .then(() => this.logger.debug("Route change from ProjectsComponent"));
      },
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
