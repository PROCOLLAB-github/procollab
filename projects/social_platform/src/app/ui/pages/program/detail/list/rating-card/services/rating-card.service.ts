/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { RateProjectUseCase } from "@api/program/use-cases/rate-project.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProjectRate } from "@domain/project/project-rate";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { HttpResponse } from "@angular/common/http";
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
  readonly programDateFinished = this.programDetailMainUIInfoService.registerDateExpired;
  readonly program = this.programDetailMainUIInfoService.program;

  readonly project = signal<ProjectRate | null>(null);
  readonly form = signal<FormControl>(new FormControl());

  readonly submitLoading = signal(false);
  readonly confirmLoading = signal(false);
  readonly showConfirmRateModal = signal(false);
  readonly locallyRatedByCurrentUser = signal(false);
  readonly projectRated = signal(false);
  readonly projectConfirmed = signal(false);
  readonly ratedCount = signal(0);

  readonly isProjectCriterias = computed(() => {
    const p = this.project();
    if (!p) return 0;
    return p.criterias.filter(c => c.type !== "str").length;
  });

  readonly isCurrentUserExpert = computed(() => {
    const currentProfile = this.profile();
    const p = this.project();
    if (!currentProfile || !p) return false;

    const isExpertFromBackend = !!p.scoredExpertId && p.scoredExpertId === currentProfile.id;

    return isExpertFromBackend || this.locallyRatedByCurrentUser();
  });

  readonly isRatedByCurrentUser = computed(() => {
    const currentUser = this.profile();
    const p = this.project();
    if (!currentUser || !p) return false;

    return p.ratedExperts.some(user => user.id === currentUser.id);
  });

  readonly userRatedThisProject = computed(() => {
    return (
      this.locallyRatedByCurrentUser() ||
      (this.project()?.ratedExperts && this.isRatedByCurrentUser())
    );
  });

  readonly isLimitReached = computed(() => {
    const p = this.project();
    return !!p && p.ratedCount >= p.maxRates;
  });

  readonly canEdit = computed(() => !this.programDateFinished());

  readonly canRate = computed(() => {
    if (this.programDateFinished()) return false;
    if (this.isLimitReached() && !this.userRatedThisProject()) return false;
    return true;
  });

  readonly canOpenModal = computed(() => {
    if (this.projectConfirmed() && this.userRatedThisProject()) return false;
    return this.canRate();
  });

  readonly rateButtonText = computed(() => {
    if (this.programDateFinished()) return "программа завершена";
    if (this.projectConfirmed() && this.userRatedThisProject()) return "проект оценен";
    if (this.isLimitReached() && !this.userRatedThisProject()) return "лимит оценок достигнут";
    return "оценить проект";
  });

  readonly showRatingForm = computed(() => !this.projectRated() && this.canEdit());

  readonly showRatedStatus = computed(() => this.projectRated() || this.projectConfirmed());

  readonly showEditButton = computed(
    () => this.projectConfirmed() && !this.programDateFinished() && this.userRatedThisProject()
  );

  readonly isButtonDisabled = computed(() => {
    if (this.isLimitReached() && !this.userRatedThisProject()) return true;
    if (this.programDateFinished()) return true;
    return !this.canRate();
  });

  readonly buttonColor = computed<"green" | "primary">(() =>
    this.userRatedThisProject() ? "green" : "primary"
  );

  readonly buttonOpacity = computed(() => (this.isButtonDisabled() ? "0.5" : "1"));

  readonly showConfirmedState = computed(
    () =>
      (this.projectConfirmed() && !this.canEdit()) ||
      (this.isLimitReached() && !this.userRatedThisProject())
  );

  readonly buttonTooltip = computed(() => {
    if (this.programDateFinished()) return "Программа завершена";
    if (this.isLimitReached() && !this.userRatedThisProject())
      return "Достигнут максимальный лимит оценок";
    if (this.userRatedThisProject()) return "Нажмите для переоценки";
    return "Нажмите для оценки проекта";
  });

  readonly isModalFormDisabled = computed(() => true);

  /** Инициализация начального состояния проекта. */
  initProject(project: ProjectRate | null): void {
    if (!project) return;
    this.project.set(project);
    const isScored = project.scored || false;
    this.projectConfirmed.set(isScored);
    this.projectRated.set(isScored);
    this.ratedCount.set(project.ratedCount);
  }

  /** Подтверждение оценки проекта. */
  confirmRateProject(): void {
    const fv = this.form().getRawValue();
    const p = this.project() as ProjectRate;

    this.submitLoading.set(true);

    this.rateProjectUseCase
      .execute(p.id, p.criterias, fv)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe({
        next: result => {
          if (!result.ok) {
            if (result.error.cause instanceof HttpResponse) {
              if (result.error.cause.status === 400) {
                this.logger.error("Ошибка: достигнут максимальный лимит оценок");
              }
            }
            return;
          }

          const profile = this.profile();
          const proj = this.project() as ProjectRate;

          this.locallyRatedByCurrentUser.set(true);
          this.projectRated.set(true);
          this.projectConfirmed.set(true);

          let isFirstTimeRating = false;

          if (profile) {
            if (!Array.isArray(proj.ratedExperts)) {
              proj.ratedExperts = [];
            }

            if (!proj.ratedExperts.some(user => user.id === profile.id)) {
              proj.ratedExperts = [...proj.ratedExperts, profile];
              isFirstTimeRating = true;
            }
          }

          if (isFirstTimeRating) {
            this.ratedCount.update(count => count + 1);
          }

          this.project.set({ ...proj });
          this.showConfirmRateModal.set(false);
        },
      });
  }

  /** Сброс статусов для переоценки. */
  redoRating(): void {
    this.projectRated.set(false);
    this.projectConfirmed.set(false);
  }
}
