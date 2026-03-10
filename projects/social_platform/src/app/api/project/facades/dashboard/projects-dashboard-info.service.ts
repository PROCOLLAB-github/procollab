/** @format */

import { inject, Injectable } from "@angular/core";
import { combineLatest, Subject, switchMap, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { SubscriptionHttpAdapter } from "projects/social_platform/src/app/infrastructure/adapters/subscription/subscription-http.adapter";
import { ProjectsDashboardUIInfoService } from "./ui/projects-dashboard-ui-info.service";
import { ProjectsService } from "../../projects.service";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

@Injectable()
export class ProjectsDashboardInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly authRepository = inject(AuthRepository);
  private readonly subscriptionService = inject(SubscriptionHttpAdapter);
  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);
  private readonly projectsService = inject(ProjectsService);

  private readonly destroy$ = new Subject<void>();

  initializationDashboardItems(): void {
    const subscriptions$ = this.authRepository.profile.pipe(
      switchMap(p => this.subscriptionService.getSubscriptions(p.id))
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
          this.projectsDashboardUIInfoService.applySetDashboardItems(all, my, subs);
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
