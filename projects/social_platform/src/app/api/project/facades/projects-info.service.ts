/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { debounceTime, distinctUntilChanged, filter, map, Subject, takeUntil } from "rxjs";
import { ProjectService } from "../project.service";
import { ProjectsUIInfoService } from "./ui/projects-ui-info.service";

@Injectable()
export class ProjectsInfoService {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly projectsUIInfoService = inject(ProjectsUIInfoService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

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
          .then(() => console.debug("QueryParams changed from ProjectsComponent"));
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

    this.projectService
      .create()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectService.projectsCount.next({
          ...this.projectService.projectsCount.getValue(),
          my: this.projectService.projectsCount.getValue().my + 1,
        });

        this.router
          .navigate([`/office/projects/${project.id}/edit`], {
            queryParams: { editingStep: "main", fromProgram },
          })
          .then(() => console.debug("Route change from ProjectsComponent"));
      });
  }
}
