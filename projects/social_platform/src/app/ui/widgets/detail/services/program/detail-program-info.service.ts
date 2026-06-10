/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ApplyProjectToProgramUseCase } from "@api/program/use-cases/apply-project-to-program.use-case";
import { GetProgramProjectAdditionalFieldsUseCase } from "@api/program/use-cases/get-program-project-additional-fields.use-case";
import {
  PartnerProgramFields,
  ProjectNewAdditionalProgramFields,
} from "@domain/program/partner-program-fields.model";

import { Router } from "@angular/router";
import { switchMap } from "rxjs";
import { ProjectFormService } from "@api/project/project-form.service";
import { Program } from "@domain/program/program.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable()
export class DetailProgramInfoService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectFormService = inject(ProjectFormService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  private readonly applyProjectToProgramUseCase = inject(ApplyProjectToProgramUseCase);
  private readonly getProgramProjectAdditionalFieldsUseCase = inject(
    GetProgramProjectAdditionalFieldsUseCase,
  );

  readonly isProjectsPage = signal<boolean>(false);
  readonly isMembersPage = signal<boolean>(false);
  readonly isProjectsRatingPage = signal<boolean>(false);
  readonly additionalFields = signal<PartnerProgramFields[]>([]);
  readonly isAssignProjectToProgramModalOpen = signal(false);
  readonly isProgramEndedModalOpen = signal(false);
  readonly isProgramSubmissionProjectsEndedModalOpen = signal<boolean>(false);
  readonly assignProjectToProgramModalMessage = signal<string | null>(null);
  readonly registerDateExpired = this.programDetailMainUIInfoService.registerDateExpired;

  private readonly projectForm = this.projectFormService.getForm();

  addNewProject(programId: number): void {
    this.getProgramProjectAdditionalFieldsUseCase
      .execute(programId)
      .pipe(
        switchMap(filtersResult => {
          const fields = filtersResult.ok ? filtersResult.value.programFields : [];
          const newFieldsFormValues = fields.map(field =>
            ProjectNewAdditionalProgramFields.fromField(field, this.placeholderFor(field)),
          );
          const body = { project: this.projectForm.value, programFieldValues: newFieldsFormValues };
          return this.applyProjectToProgramUseCase.execute(programId, body);
        }),
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

          this.router
            .navigate([AppRoutes.projects.edit(response.projectId)], {
              queryParams: { editingStep: "additional", fromProgram: true },
            })
            .then(() => this.logger.debug("Route change from ProjectsComponent"));
        },
      });
  }

  private placeholderFor(field: PartnerProgramFields): string | boolean {
    if (field.fieldType === "checkbox") return false;
    if (field.options.length > 0) return field.options[0];
    return "-";
  }

  /**
   * Проверка завершения программы перед регистрацией
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
    } else {
      this.router.navigateByUrl(AppRoutes.program.register(program.id));
    }
  }

  applyUpdateStage(stage: "projects" | "projects-rating" | "members", isStage: boolean): void {
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
    }
  }
}
