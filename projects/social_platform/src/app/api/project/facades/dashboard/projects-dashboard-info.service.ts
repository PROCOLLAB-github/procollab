/** @format */

import { inject, Injectable } from "@angular/core";
import { combineLatest, Subject, switchMap, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { ProjectsDashboardUIInfoService } from "./ui/projects-dashboard-ui-info.service";
import { ProjectsService } from "../../projects.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { GetProjectSubscriptionsUseCase } from "../../use-case/get-project-subscriptions.use-case";

@Injectable()
export class ProjectsDashboardInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly getProjectSubscriptionsUseCase = inject(GetProjectSubscriptionsUseCase);
  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);
  private readonly projectsService = inject(ProjectsService);

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
    this.projectsService.addProject();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
