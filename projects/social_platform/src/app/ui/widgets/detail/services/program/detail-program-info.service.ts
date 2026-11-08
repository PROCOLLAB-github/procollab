/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

import { Router } from "@angular/router";
import { Program } from "@domain/program/program.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GetSolutionContextUseCase } from "@api/solution/use-cases/solution.use-cases";
import {
  solutionApplicationRoute,
  solutionCreationBlockedMessage,
} from "@api/solution/solution-navigation";

@Injectable()
export class DetailProgramInfoService {
  private static readonly MIR_PROGRAM_NAME = "Кейс-чемпионат MIR";
  private static readonly MIR_REGISTRATION_LINK = "https://case-champ.ru/corporate#rec1176757836";

  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly getSolutionContext = inject(GetSolutionContextUseCase);

  readonly isProjectsPage = signal<boolean>(false);
  readonly isMembersPage = signal<boolean>(false);
  readonly isProjectsRatingPage = signal<boolean>(false);
  readonly isAnalyticsPage = signal<boolean>(false);
  readonly isPublishedSolutionsPage = signal(false);
  readonly additionalFields = signal<PartnerProgramFields[]>([]);
  readonly isAssignProjectToProgramModalOpen = signal(false);
  readonly isProgramEndedModalOpen = signal(false);
  readonly isProgramSubmissionProjectsEndedModalOpen = signal<boolean>(false);
  readonly assignProjectToProgramModalMessage = signal<string | null>(null);
  readonly registerDateExpired = this.programDetailMainUIInfoService.registerDateExpired;

  readonly legacyEntryProgramId = signal<number | null>(null);

  readonly application = computed(
    () => this.programDetailMainUIInfoService.program()?.currentApplication ?? null,
  );
  readonly applicationPending = signal(false);
  readonly applicationLabel = computed(() =>
    this.programDetailMainUIInfoService.program()?.solutionStorageMode === "solution"
      ? "мое решение"
      : this.application()?.submitted
        ? "открыть сданный проект"
        : this.application()
          ? "открыть черновик"
          : "подать проект",
  );

  addNewProject(programId: number): void {
    if (this.programDetailMainUIInfoService.program()?.preview) return;
    if (this.applicationPending()) return;
    const solutionMode =
      this.programDetailMainUIInfoService.program()?.solutionStorageMode === "solution";
    if (!solutionMode) {
      this.addLegacyProject(programId);
      return;
    }
    this.applicationPending.set(true);
    this.getSolutionContext
      .execute(programId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.applicationPending.set(false);
        if (this.programDetailMainUIInfoService.program()?.id !== programId) return;
        if (!result.ok) {
          this.assignProjectToProgramModalMessage.set(result.error.detail);
          this.isAssignProjectToProgramModalOpen.set(true);
          return;
        }
        const context = result.value;
        if (context.currentApplication) {
          const destination = solutionApplicationRoute(context.currentApplication);
          void this.router.navigate([destination.path], { queryParams: destination.queryParams });
        } else if (context.storageMode === "legacy_project") {
          this.addLegacyProject(programId);
        } else if (context.canCreate) {
          void this.router.navigate([AppRoutes.program.solutionCreate(programId)]);
        } else {
          this.assignProjectToProgramModalMessage.set(
            solutionCreationBlockedMessage(context.blockedReason),
          );
          this.isAssignProjectToProgramModalOpen.set(true);
        }
      });
  }

  private addLegacyProject(programId: number): void {
    const application = this.application();
    if (!application) {
      this.legacyEntryProgramId.set(programId);
      return;
    }
    if (application.submitted) {
      void this.router.navigate([AppRoutes.projects.detail(application.projectId)]);
      return;
    }
    void this.router
      .navigate([AppRoutes.projects.edit(application.projectId)], {
        queryParams: { editingStep: "additional", programLinkId: application.programLinkId },
      })
      .then(() => this.logger.debug("Route change from ProjectsComponent"));
  }

  /**
   * Возвращает подтверждённую внешнюю ссылку регистрации, включая legacy-сценарий MIR.
   */
  getRegistrationLink(program: Program): string | null {
    if (program.registrationManaged) return program.registrationLink;
    const normalizedName = program.name.replace(/\s+/g, " ").trim();
    if (normalizedName.includes(DetailProgramInfoService.MIR_PROGRAM_NAME)) {
      return DetailProgramInfoService.MIR_REGISTRATION_LINK;
    }

    return program.registrationLink;
  }

  /**
   * Блокирует внешнюю регистрацию, если закончился один из разрешённых периодов.
   */
  checkPrograRegistrationEnded(event: Event, program: Program): void {
    if (
      program?.datetimeRegistrationEnds &&
      Date.now() > Date.parse(program.datetimeRegistrationEnds)
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.isProgramEndedModalOpen.set(true);
    } else if (
      program?.datetimeProjectSubmissionEnds &&
      Date.now() > Date.parse(program?.datetimeProjectSubmissionEnds)
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.isProgramSubmissionProjectsEndedModalOpen.set(true);
    }
  }

  applyUpdateStage(
    stage: "projects" | "projects-rating" | "members" | "analytics" | "published-solutions",
    isStage: boolean,
  ): void {
    switch (stage) {
      case "published-solutions":
        this.isPublishedSolutionsPage.set(isStage);
        break;
      case "projects":
        this.isProjectsPage.set(isStage);
        break;

      case "members":
        this.isMembersPage.set(isStage);
        break;

      case "projects-rating":
        this.isProjectsRatingPage.set(isStage);
        break;

      case "analytics":
        this.isAnalyticsPage.set(isStage);
        break;
    }
  }
}
