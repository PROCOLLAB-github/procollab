/** @format */

import { inject, Injectable } from "@angular/core";
import { combineLatest, Subject, switchMap, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../auth";
import { SubscriptionService } from "../../../subsriptions/subscription.service";
import { ProjectsDashboardUIInfoService } from "./ui/projects-dashboard-ui-info.service";

@Injectable()
export class ProjectsDashboardInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly projectsDashboardUIInfoService = inject(ProjectsDashboardUIInfoService);

  private readonly destroy$ = new Subject<void>();

  initializationDashboardItems(): void {
    const subscriptions$ = this.authService.profile.pipe(
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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
