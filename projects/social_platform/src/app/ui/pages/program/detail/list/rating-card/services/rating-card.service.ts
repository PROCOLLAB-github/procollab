/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { RateProjectUseCase } from "@api/program/use-cases/rate-project.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProjectRate } from "@domain/project/project-rate";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";
import { FormControl } from "@angular/forms";

/** Сервис бизнес-логики карточки оценки проекта экспертом. */
@Injectable()
export class RatingCardService {
  private readonly rateProjectUseCase = inject(RateProjectUseCase);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly logger = inject(LoggerService);

  readonly profile = this.profileInfoService.profile;
  readonly evaluationDateExpired = this.programDetailMainUIInfoService.evaluationDateExpired;
  readonly program = this.programDetailMainUIInfoService.program;

  readonly project = signal<ProjectRate | null>(null);
  readonly form = signal<FormControl>(new FormControl());

  readonly submitLoading = signal(false);
  readonly confirmLoading = signal(false);
  readonly showConfirmRateModal = signal(false);
  readonly backendEvaluationClosed = signal(false);
  readonly projectRated = signal(false);
  readonly projectConfirmed = signal(false);
  readonly ratedCount = signal(0);

  readonly isProjectCriterias = computed(() => {
    const p = this.project();
    if (!p) return 0;
    return p.criterias.filter(c => c.type !== "str").length;
  });

  readonly isRatedByCurrentUser = computed(() => {
    const p = this.project();
    return p?.scored === true;
  });

  readonly userRatedThisProject = this.isRatedByCurrentUser;

  readonly evaluationClosed = computed(
    () => this.evaluationDateExpired() || this.backendEvaluationClosed(),
  );

  readonly isLimitReached = computed(() => {
    const p = this.project();
    return !!p && p.ratedCount >= p.maxRates;
  });

  readonly canEdit = computed(() => !this.evaluationClosed());

  readonly canRate = computed(() => {
    if (this.evaluationClosed()) return false;
    if (this.isLimitReached() && !this.userRatedThisProject()) return false;
    return true;
  });

  readonly canOpenModal = computed(() => {
    if (this.projectConfirmed() && this.userRatedThisProject()) return false;
    return this.canRate();
  });

  readonly rateButtonText = computed(() => {
    if (this.evaluationClosed()) return "оценивание завершено";
    if (this.projectConfirmed() && this.userRatedThisProject()) return "проект оценён";
    if (this.isLimitReached() && !this.userRatedThisProject()) return "лимит оценок достигнут";
    if (this.userRatedThisProject()) return "подтвердить изменения";
    return "оценить проект";
  });

  readonly showRatingForm = computed(() => !this.projectRated() && this.canEdit());

  readonly isRatingFormDisabled = computed(
    () =>
      this.evaluationClosed() ||
      ((this.projectRated() || this.projectConfirmed()) && this.isRatedByCurrentUser()),
  );

  readonly showRatedStatus = computed(() => this.projectRated() || this.projectConfirmed());

  readonly showEditButton = computed(
    () => this.projectConfirmed() && this.canEdit() && this.userRatedThisProject(),
  );

  readonly isButtonDisabled = computed(() => {
    if (this.isLimitReached() && !this.userRatedThisProject()) return true;
    if (this.evaluationClosed()) return true;
    return !this.canRate();
  });

  readonly buttonColor = computed<"green" | "primary">(() =>
    this.projectConfirmed() && this.userRatedThisProject() ? "green" : "primary",
  );

  readonly buttonOpacity = computed(() => (this.isButtonDisabled() ? "0.5" : "1"));

  readonly showConfirmedState = computed(
    () => this.evaluationClosed() || (this.isLimitReached() && !this.userRatedThisProject()),
  );

  readonly buttonTooltip = computed(() => {
    if (this.evaluationClosed()) return "Срок оценивания завершён";
    if (this.isLimitReached() && !this.userRatedThisProject())
      return "Достигнут максимальный лимит оценок";
    if (this.userRatedThisProject()) return "Нажмите для переоценки";
    return "Нажмите для оценки проекта";
  });

  readonly isModalFormDisabled = computed(() => true);

  /** Инициализация начального состояния проекта. */
  initProject(project: ProjectRate | null): void {
    if (!project) return;
    this.backendEvaluationClosed.set(false);
    this.project.set(project);
    const isScored = project.scored || false;
    this.projectConfirmed.set(isScored);
    this.projectRated.set(isScored);
    this.ratedCount.set(project.ratedCount);
  }

  /** Подтверждение оценки проекта. */
  confirmRateProject(): void {
    if (this.evaluationClosed()) return;
    const fv = this.form().getRawValue();
    const p = this.project() as ProjectRate;

    this.submitLoading.set(true);

    this.rateProjectUseCase
      .execute(p.id, p.criterias, fv)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe({
        next: result => {
          if (!result.ok) {
            if (this.isEvaluationDeadlineError(result.error.cause)) {
              this.backendEvaluationClosed.set(true);
              this.showConfirmRateModal.set(false);
              return;
            }

            if (
              result.error.cause instanceof HttpErrorResponse &&
              result.error.cause.status === 400
            ) {
              this.logger.error("Ошибка: достигнут максимальный лимит оценок");
            }
            return;
          }

          const profile = this.profile();
          const proj = this.project() as ProjectRate;

          this.projectRated.set(true);
          this.projectConfirmed.set(true);

          const isFirstTimeRating = !proj.scored;
          let ratedExperts = Array.isArray(proj.ratedExperts) ? proj.ratedExperts : [];

          if (profile && !ratedExperts.includes(profile.id)) {
            ratedExperts = [...ratedExperts, profile.id];
          }

          if (isFirstTimeRating) {
            this.ratedCount.update(count => count + 1);
          }

          this.project.set({ ...proj, scored: true, ratedExperts });
          this.showConfirmRateModal.set(false);
        },
      });
  }

  /** Сброс статусов для переоценки. */
  redoRating(): void {
    if (!this.canEdit()) return;
    this.projectRated.set(false);
    this.projectConfirmed.set(false);
  }

  private isEvaluationDeadlineError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse) || error.status !== 409) return false;
    if (!error.error || typeof error.error !== "object") return false;

    return (error.error as { error?: unknown }).error === "evaluation_deadline_passed";
  }
}
