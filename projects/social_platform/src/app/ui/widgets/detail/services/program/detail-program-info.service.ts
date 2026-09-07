/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";
import { Project } from "@domain/project/project.model";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ApplyProjectToProgramUseCase } from "@api/program/use-cases/apply-project-to-program.use-case";
import { GetProgramProjectAdditionalFieldsUseCase } from "@api/program/use-cases/get-program-project-additional-fields.use-case";
import {
  PartnerProgramFields,
  ProjectNewAdditionalProgramFields,
} from "@domain/program/partner-program-fields.model";

import { Router } from "@angular/router";
import { EMPTY, expand, finalize, last, of, Subscription, switchMap } from "rxjs";
import { ProjectFormService } from "@api/project/project-form.service";
import { Program } from "@domain/program/program.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { PROGRAM_CASE_FIELD_NAME } from "@domain/program/program-case-field.const";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable()
export class DetailProgramInfoService {
  private static readonly MIR_PROGRAM_NAME = "Кейс-чемпионат MIR";
  private static readonly MIR_REGISTRATION_LINK = "https://case-champ.ru/corporate#rec1176757836";

  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectFormService = inject(ProjectFormService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  private readonly applyProjectToProgramUseCase = inject(ApplyProjectToProgramUseCase);
  private readonly getMyProjectsUseCase = inject(GetMyProjectsUseCase);
  private readonly getProjectUseCase = inject(GetProjectUseCase);
  private readonly getProgramProjectAdditionalFieldsUseCase = inject(
    GetProgramProjectAdditionalFieldsUseCase,
  );

  readonly isProjectsPage = signal<boolean>(false);
  readonly isMembersPage = signal<boolean>(false);
  readonly isProjectsRatingPage = signal<boolean>(false);
  readonly isAnalyticsPage = signal<boolean>(false);
  readonly additionalFields = signal<PartnerProgramFields[]>([]);
  readonly isAssignProjectToProgramModalOpen = signal(false);
  readonly isProgramEndedModalOpen = signal(false);
  readonly isProgramSubmissionProjectsEndedModalOpen = signal<boolean>(false);
  readonly assignProjectToProgramModalMessage = signal<string | null>(null);
  readonly registerDateExpired = this.programDetailMainUIInfoService.registerDateExpired;

  private readonly projectForm = this.projectFormService.getForm();

  readonly application = signal<{
    projectId: number;
    programLinkId: number;
    submitted: boolean;
  } | null>(null);
  readonly applicationPending = signal(false);
  readonly applicationLoadFailed = signal(false);
  readonly applicationLabel = computed(() =>
    this.applicationLoadFailed()
      ? "Повторить проверку заявки"
      : this.application()?.submitted
        ? "вы подали проект"
        : this.application()
          ? "Перейти в заявку"
          : "Создать заявку",
  );
  private applicationContext: { programId: number; userId: number } | null = null;
  private applicationRequest?: Subscription;

  /** Draft applications are real applications too; inspect all pages of the existing self API. */
  loadApplication(programId: number, userId: number): void {
    this.applicationRequest?.unsubscribe();
    this.applicationContext = { programId, userId };
    this.application.set(null);
    this.applicationLoadFailed.set(false);
    this.applicationPending.set(true);
    let offset = 0;
    const findApplication = (projects: Project[]) =>
      projects.find(
        project => project.leader === userId && project.partnerProgram?.id === programId,
      );
    const loadPage = () =>
      this.getMyProjectsUseCase.execute(new HttpParams({ fromObject: { limit: 50, offset } }));

    this.applicationRequest = loadPage()
      .pipe(
        expand(result => {
          if (!result.ok || findApplication(result.value.results)) return EMPTY;
          offset += result.value.results.length;
          return result.value.results.length && offset < result.value.count ? loadPage() : EMPTY;
        }),
        last(),
        switchMap(result => {
          if (!result.ok) {
            this.applicationLoadFailed.set(true);
            return EMPTY;
          }
          const project = findApplication(result.value.results);
          return project ? this.getProjectUseCase.execute(project.id) : of(null);
        }),
        finalize(() => this.applicationPending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result) return;
        if (!result.ok || result.value.partnerProgram?.programId !== programId) {
          this.applicationLoadFailed.set(true);
          return;
        }
        const project = result.value;
        this.application.set({
          projectId: project.id,
          programLinkId: project.partnerProgram!.programLinkId,
          submitted: project.partnerProgram!.isSubmitted,
        });
      });
  }

  addNewProject(programId: number): void {
    if (this.applicationPending() || this.application()?.submitted) return;
    if (this.applicationLoadFailed()) {
      if (this.applicationContext) this.loadApplication(programId, this.applicationContext.userId);
      return;
    }
    if (this.application()) {
      this.openApplication();
      return;
    }
    this.applicationPending.set(true);
    this.applicationRequest = this.getProgramProjectAdditionalFieldsUseCase
      .execute(programId)
      .pipe(
        switchMap(filtersResult => {
          const fields = filtersResult.ok ? filtersResult.value.programFields : [];
          const newFieldsFormValues = fields
            .filter(field => field.fieldType !== "file" && field.name !== PROGRAM_CASE_FIELD_NAME)
            .map(field =>
              ProjectNewAdditionalProgramFields.fromField(field, this.placeholderFor(field)),
            );
          const body = { project: this.projectForm.value, programFieldValues: newFieldsFormValues };
          return this.applyProjectToProgramUseCase.execute(programId, body);
        }),
        finalize(() => this.applicationPending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            const error = result.error.cause as
              | { status?: number; error?: { detail?: string } }
              | undefined;
            if (error?.status === 400) {
              this.isAssignProjectToProgramModalOpen.set(true);
              this.assignProjectToProgramModalMessage.set(error.error?.detail ?? null);
            }
            return;
          }

          const response = result.value;
          this.application.set({ ...response, submitted: false });
          this.openApplication();
        },
      });
  }

  private openApplication(): void {
    const application = this.application();
    if (!application || application.submitted) return;
    this.router
      .navigate([AppRoutes.projects.edit(application.projectId)], {
        queryParams: {
          editingStep: "additional",
          fromProgram: true,
          programLinkId: application.programLinkId,
        },
      })
      .then(() => this.logger.debug("Route change from ProjectsComponent"));
  }

  private placeholderFor(field: PartnerProgramFields): string {
    if (field.fieldType === "checkbox") return "false";
    if (field.options.length > 0) return field.options[0];
    return "-";
  }

  /**
   * Возвращает подтверждённую внешнюю ссылку регистрации, включая legacy-сценарий MIR.
   */
  getRegistrationLink(program: Program): string | null {
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
    stage: "projects" | "projects-rating" | "members" | "analytics",
    isStage: boolean,
  ): void {
    switch (stage) {
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
