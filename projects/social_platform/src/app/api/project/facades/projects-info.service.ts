/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { debounceTime, distinctUntilChanged, filter, map, Subject, takeUntil, tap } from "rxjs";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { ProjectsUIInfoService } from "./ui/projects-ui-info.service";
import { CreateProjectUseCase } from "../use-case/create-project.use-case";

@Injectable()
export class ProjectsInfoService {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectsUIInfoService = inject(ProjectsUIInfoService);
  private readonly createProjectUseCase = inject(CreateProjectUseCase);

  private readonly destroy$ = new Subject<void>();
  private readonly logger = inject(LoggerService);

  private readonly url = signal(this.router.url);
  private readonly searchForm = this.projectsUIInfoService.searchForm;

  readonly isMy = computed(() => this.url().includes("/my"));
  readonly isAll = computed(() => this.url().includes("/all"));
  readonly isSubs = computed(() => this.url().includes("/subscriptions"));
  readonly isInvites = computed(() => this.url().includes("/invites"));
  readonly isDashboard = computed(() => this.url().includes("/dashboard"));

  initializationProjects(): void {
    this.navService.setNavTitle("Проекты");

    this.route.data
      .pipe(map(r => r["data"]))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: invites => {
          this.projectsUIInfoService.applySetProjectsInvites(invites);
        },
      });

    this.searchForm
      .get("search")
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { name__contains: search },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => this.logger.debug("QueryParams changed from ProjectsComponent"));
      });

    this.initializationRouterEvents();
  }

  initializationRouterEvents(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.url.set(this.router.url));
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addProject(): void {
    const fromProgram =
      this.route.snapshot.parent?.routeConfig?.path === "programs" ? { fromProgram: true } : null;

    this.createProjectUseCase
      .execute()
      .pipe(
        tap(result => {
          if (!result.ok) return;

          this.router
            .navigate([`/office/projects/${result.value.id}/edit`], {
              queryParams: { editingStep: "main", fromProgram },
            })
            .then(() => this.logger.debug("Route change from ProjectsComponent"));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
