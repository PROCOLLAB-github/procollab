/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { concatMap, map, Subject, takeUntil } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { LeaveProjectUseCase } from "@api/project/use-cases/leave-project.use-case";
import { AppRoutes } from "@api/paths/app-routes";

@Injectable()
export class DetailProjectInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly leaveProjectUseCase = inject(LeaveProjectUseCase);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  readonly isTeamPage = signal<boolean>(false);
  readonly isVacanciesPage = signal<boolean>(false);
  readonly isProjectChatPage = signal<boolean>(false);
  readonly submissionProjectDateExpired?: boolean;
  readonly isProjectWorkSectionPage = signal<boolean>(false);
  readonly isKanbanBoardPage = signal<boolean>(false);
  readonly isGantDiagramPage = signal<boolean>(false);
  readonly isLeaveProjectModalOpen = signal<boolean>(false); // Флаг модального окна выхода
  readonly isEditDisable = signal<boolean>(false); // Флаг недоступности редактирования
  readonly isEditDisableModal = signal<boolean>(false); // Флаг недоступности редактирования для модалки
  readonly openSupport = signal<boolean>(false); // Флаг модального окна поддержки
  readonly leaderLeaveModal = signal<boolean>(false); // Флаг модального окна предупреждения лидера

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applySetIsDisabled(isSubmitted: boolean): void {
    this.isEditDisable.set(isSubmitted ?? false);
  }

  /**
   * Закрытие модального окна выхода из проекта
   */
  onCloseLeaveProjectModal(): void {
    this.isLeaveProjectModalOpen.set(false);
  }

  /**
   * Закрытие модального окна для невозможности редактировать проект
   */
  onUnableEditingProject(): void {
    if (this.isEditDisable()) {
      this.isEditDisableModal.set(true);
    } else {
      this.isEditDisableModal.set(false);
    }
  }

  /**
   * Выход из проекта
   */
  onLeave() {
    this.route.data
      .pipe(
        map(r => r["data"][0]),
        concatMap(p => this.leaveProjectUseCase.execute(p.id)),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result.ok) {
          this.leaderLeaveModal.set(true);
          return;
        }

        this.router
          .navigateByUrl(AppRoutes.projects.my())
          .then(() => this.logger.debug("Route changed from ProjectInfoComponent"));
      });
  }

  routingToMyProjects(): void {
    this.router.navigateByUrl(AppRoutes.projects.my());
  }

  applyUpdateStage(
    stage: "team" | "vacancies" | "chat" | "work-section" | "gant-diagram" | "kanban",
    isStage: boolean
  ): void {
    switch (stage) {
      case "team":
        this.isTeamPage.set(isStage);
        break;

      case "chat":
        this.isProjectChatPage.set(isStage);
        break;

      case "gant-diagram":
        this.isGantDiagramPage.set(isStage);
        break;

      case "kanban":
        this.isKanbanBoardPage.set(isStage);
        break;

      case "vacancies":
        this.isVacanciesPage.set(isStage);
        break;

      case "work-section":
        this.isProjectWorkSectionPage.set(isStage);
        break;
    }
  }
}
