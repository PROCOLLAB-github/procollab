/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ProgramDetailMainUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ApplyProjectToProgramUseCase } from "projects/social_platform/src/app/api/program/use-cases/apply-project-to-program.use-case";
import {
  PartnerProgramFields,
  ProjectNewAdditionalProgramFields,
} from "projects/social_platform/src/app/domain/program/partner-program-fields.model";
import { Subject, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { ProjectFormService } from "projects/social_platform/src/app/api/project/project-form.service";
import { Program } from "projects/social_platform/src/app/domain/program/program.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";

@Injectable()
export class DetailProgramInfoService {
  private readonly router = inject(Router);
  private readonly applyProjectToProgramUseCase = inject(ApplyProjectToProgramUseCase);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

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
    const newFieldsFormValues: ProjectNewAdditionalProgramFields[] = [];

    this.additionalFields().forEach((field: PartnerProgramFields) => {
      newFieldsFormValues.push({
        field_id: field.id,
        value_text: field.options.length ? field.options[0] : "'",
      });
    });

    const body = { project: this.projectForm.value, program_field_values: newFieldsFormValues };

    this.applyProjectToProgramUseCase
      .execute(programId, body)
      .pipe(takeUntil(this.destroy$))
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
            .navigate([`/office/projects/${response.projectId}/edit`], {
              queryParams: { editingStep: "main", fromProgram: true },
            })
            .then(() => this.logger.debug("Route change from ProjectsComponent"));
        },
      });
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
      this.router.navigateByUrl("/office/program/" + program.id + "/register");
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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
