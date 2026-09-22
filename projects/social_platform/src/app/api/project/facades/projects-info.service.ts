/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { debounceTime, distinctUntilChanged, filter, tap } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProjectsUIInfoService } from "./ui/projects-ui-info.service";
import { CreateProjectUseCase } from "../use-cases/create-project.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { InviteInfoService } from "@api/invite/facades/invite-info.service";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";

/** Координирует верхний уровень раздела проектов: табы, поиск и создание проекта. */
@Injectable()
export class ProjectsInfoService {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly inviteInfoService = inject(InviteInfoService);
  private readonly projectsUIInfoService = inject(ProjectsUIInfoService);

  private readonly createProjectUseCase = inject(CreateProjectUseCase);
  private readonly projectRepository = inject(ProjectRepositoryPort);

  private readonly url = signal(this.router.url);
  private readonly searchForm = this.projectsUIInfoService.searchForm;

  readonly isMy = computed(() => this.url().includes("/my"));
  readonly isAll = computed(() => this.url().includes("/all"));
  readonly isSubs = computed(() => this.url().includes("/subscriptions"));
  readonly isInvites = computed(() => this.url().includes("/invites"));
  readonly isDashboard = computed(() => this.url().includes("/dashboard"));
  readonly projectCount = toSignal(this.projectRepository.count$, { requireSync: true });
  readonly projectCountState = toSignal(this.projectRepository.countState$, {
    requireSync: true,
  });

  initializationProjects(): void {
    this.navService.setNavTitle("Проекты");

    this.inviteInfoService.ensureLoaded();
    this.refreshProjectCountIfVisible();

    this.searchForm
      .get("search")
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
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
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const previousSection = this.activitySection(this.url());
        this.url.set(this.router.url);
        const currentSection = this.activitySection(this.url());

        if (currentSection && currentSection !== previousSection) {
          this.refreshProjectCountIfVisible();
        }
      });
  }

  private activitySection(url: string): "dashboard" | "my" | null {
    if (url.includes("/dashboard")) return "dashboard";
    if (url.includes("/my")) return "my";
    return null;
  }

  private refreshProjectCountIfVisible(): void {
    if (!this.isMy() && !this.isDashboard()) return;

    this.projectRepository
      .refreshCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: error => this.logger.warn("Не удалось загрузить статистику проектов", error),
      });
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
            .navigate([AppRoutes.projects.edit(result.value.id)], {
              queryParams: { editingStep: "main", fromProgram },
            })
            .then(() => this.logger.debug("Route change from ProjectsComponent"));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
