/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { RateProjectUseCase } from "@api/program/use-cases/rate-project.use-case";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProjectRate } from "@domain/project/project-rate";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { finalize } from "rxjs";
import { FormControl } from "@angular/forms";

/** Сервис бизнес-логики карточки оценки проекта экспертом. */
@Injectable()
export class RatingCardService {
  private readonly rateProjectUseCase = inject(RateProjectUseCase);
  private readonly getRatings = inject(GetProjectRatingsUseCase);
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
  readonly locallyRatedByCurrentUser = signal(false);
  readonly projectRated = signal(false);
  readonly projectConfirmed = signal(false);
  readonly ratedCount = signal(0);
  readonly ratingError = signal<string | null>(null);
  readonly criteriaChanged = signal(false);
  readonly refreshingCriteria = signal(false);
  readonly retainedAnswers = signal<{ name: string; value: string }[]>([]);

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

    return (
      p.scored ||
      p.ratedExperts.some(user => (typeof user === "number" ? user : user.id) === currentUser.id)
    );
  });

  readonly userRatedThisProject = computed(() => {
    return (
      this.locallyRatedByCurrentUser() ||
      (this.project()?.ratedExperts && this.isRatedByCurrentUser())
    );
  });

  readonly isLimitReached = computed(() => {
    const p = this.project();
    return !!p && !p.managedEvaluation && p.ratedCount >= p.maxRates;
  });

  readonly canEdit = computed(() => !this.evaluationDateExpired());

  readonly canRate = computed(() => {
    const project = this.project();
    if (project?.criteriaRevision && !project.criterias.length) return false;
    if (this.evaluationDateExpired()) return false;
    if (this.isLimitReached() && !this.userRatedThisProject()) return false;
    return true;
  });

  readonly canOpenModal = computed(() => {
    if (this.projectConfirmed() && this.userRatedThisProject()) return false;
    return this.canRate();
  });

  readonly rateButtonText = computed(() => {
    if (this.evaluationDateExpired()) return "оценивание завершено";
    if (this.project()?.criteriaRevision && !this.project()?.criterias.length)
      return "критерии не настроены";
    if (this.projectConfirmed() && this.userRatedThisProject()) return "проект оценен";
    if (this.isLimitReached() && !this.userRatedThisProject()) return "лимит оценок достигнут";
    if (this.userRatedThisProject()) return "подтвердить изменения";
    return "оценить проект";
  });

  readonly showRatingForm = computed(() => !this.projectRated() && this.canEdit());

  readonly isRatingFormDisabled = computed(
    () =>
      this.evaluationDateExpired() ||
      ((this.projectRated() || this.projectConfirmed()) && this.isRatedByCurrentUser()),
  );

  readonly showRatedStatus = computed(() => this.projectRated() || this.projectConfirmed());

  readonly showEditButton = computed(
    () => this.projectConfirmed() && this.canEdit() && this.userRatedThisProject(),
  );

  readonly isButtonDisabled = computed(() => {
    if (this.isLimitReached() && !this.userRatedThisProject()) return true;
    if (this.evaluationDateExpired()) return true;
    return !this.canRate();
  });

  readonly buttonColor = computed<"green" | "primary">(() =>
    this.projectConfirmed() && this.userRatedThisProject() ? "green" : "primary",
  );

  readonly buttonOpacity = computed(() => (this.isButtonDisabled() ? "0.5" : "1"));

  readonly showConfirmedState = computed(
    () => this.evaluationDateExpired() || (this.isLimitReached() && !this.userRatedThisProject()),
  );

  readonly buttonTooltip = computed(() => {
    if (this.evaluationDateExpired()) return "Срок оценивания завершен";
    if (this.isLimitReached() && !this.userRatedThisProject())
      return "Достигнут максимальный лимит оценок";
    if (this.userRatedThisProject()) return "Нажмите для переоценки";
    return "Нажмите для оценки проекта";
  });

  readonly isModalFormDisabled = computed(() => true);

  /** Инициализация начального состояния проекта. */
  initProject(project: ProjectRate | null): void {
    if (!project) return;
    this.form.set(new FormControl());
    this.locallyRatedByCurrentUser.set(false);
    this.ratingError.set(null);
    this.criteriaChanged.set(false);
    this.retainedAnswers.set([]);
    this.project.set(project);
    const isScored = project.scored || false;
    this.projectConfirmed.set(isScored);
    this.projectRated.set(isScored);
    this.ratedCount.set(project.ratedCount);
  }

  /** Подтверждение оценки проекта. */
  confirmRateProject(): void {
    if (!this.canRate() || this.submitLoading() || this.form().invalid || this.criteriaChanged())
      return;
    const fv = this.form().getRawValue();
    const p = this.project() as ProjectRate;

    this.submitLoading.set(true);
    this.ratingError.set(null);

    const request =
      p.criteriaRevision === undefined
        ? this.rateProjectUseCase.execute(p.id, p.criterias, fv)
        : this.rateProjectUseCase.execute(p.id, p.criterias, fv, p.criteriaRevision);
    request.pipe(finalize(() => this.submitLoading.set(false))).subscribe({
      next: result => {
        if (!result.ok) {
          const cause = result.error.cause;
          const stale = cause instanceof HttpErrorResponse && cause.status === 409;
          this.criteriaChanged.set(stale);
          this.ratingError.set(
            stale
              ? "Критерии изменились. Обновите форму: введенные ответы сохранятся для сравнения."
              : "Не удалось сохранить оценку. Проверьте ответы и повторите попытку.",
          );
          this.showConfirmRateModal.set(false);
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

          if (
            !proj.ratedExperts.some(
              user => (typeof user === "number" ? user : user.id) === profile.id,
            )
          ) {
            proj.ratedExperts = [...proj.ratedExperts, profile];
            isFirstTimeRating = true;
          }
        }

        if (isFirstTimeRating) {
          this.ratedCount.update(count => count + 1);
        }

        this.project.set({ ...proj, scored: true });
        this.form().markAsPristine();
        this.showConfirmRateModal.set(false);
      },
    });
  }

  refreshCriteria(): void {
    const project = this.project(),
      programId = this.program()?.id;
    if (!project || !programId || this.refreshingCriteria()) return;
    const answers = this.form().getRawValue() ?? {};
    this.retainedAnswers.set(
      project.criterias.map(c => ({
        name: c.name,
        value: String(answers[c.id] ?? c.value ?? "—"),
      })),
    );
    this.refreshingCriteria.set(true);
    this.getRatings
      .execute(programId, new HttpParams().set("project_id", project.id))
      .pipe(finalize(() => this.refreshingCriteria.set(false)))
      .subscribe(result => {
        if (this.project()?.id !== project.id || this.program()?.id !== programId) return;
        const fresh = result.ok ? result.value.results.find(p => p.id === project.id) : null;
        if (!fresh) {
          this.ratingError.set("Не удалось обновить критерии. Введенные ответы сохранены в форме.");
          return;
        }
        const values: Record<string, unknown> = {};
        fresh.criterias = fresh.criterias.map(c => {
          const previous = project.criterias.find(old => old.id === c.id && old.type === c.type);
          if (previous && Object.prototype.hasOwnProperty.call(answers, c.id))
            values[c.id] = answers[c.id];
          return c;
        });
        this.form().setValue(values);
        this.project.set(fresh);
        this.criteriaChanged.set(false);
        this.ratingError.set(
          "Форма обновлена. Проверьте ответы по новым формулировкам и шкалам перед сохранением.",
        );
      });
  }

  /** Сброс статусов для переоценки. */
  redoRating(): void {
    if (!this.canEdit()) return;
    this.projectRated.set(false);
    this.projectConfirmed.set(false);
  }
}
