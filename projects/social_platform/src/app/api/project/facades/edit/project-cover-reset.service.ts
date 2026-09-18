/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { finalize, takeUntil } from "rxjs";
import { ResetProjectCoverUseCase } from "../../use-cases/reset-project-cover.use-case";
import { ProjectFormService } from "./project-form.service";

/**
 * Команда живёт вместе с редактором, а не отдельным шагом: переход к команде
 * или кейсу не должен потерять ответ уже сохранённого сброса. Форма не очищается.
 */
@Injectable()
export class ProjectCoverResetService {
  private readonly form = inject(ProjectFormService);
  private readonly resetCover = inject(ResetProjectCoverUseCase);
  private readonly snackbar = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);
  readonly pending = signal(false);

  /**
   * Повторный клик игнорируется. Смена данных проекта (включая повторное открытие
   * того же ID) и уничтожение редактора отменяют подписку до изменения новой формы.
   */
  reset(): void {
    const id = this.form.currentProjectId();
    if (this.pending() || this.form.isDefaultCover() !== false || id === null) return;
    const previousUrl = this.form.coverImageAddress?.value;
    this.pending.set(true);
    this.form.coverResetPending = true;
    this.resetCover
      .execute(id)
      .pipe(
        takeUntil(this.form.contextChanged$),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending.set(false);
          this.form.coverResetPending = false;
        }),
      )
      .subscribe(result => {
        // Защита от параллельной замены файла без смены контекста проекта.
        if (this.form.coverImageAddress?.value !== previousUrl) return;
        if (result.ok) {
          this.form.coverImageAddress?.setValue(result.value.coverImageAddress);
          this.form.coverImageAddress?.markAsDirty();
          this.form.isDefaultCover.set(true);
        } else {
          const message =
            result.error === "unavailable"
              ? "Стандартная обложка временно недоступна."
              : result.error === "forbidden"
                ? "Нет доступа к изменению обложки проекта."
                : "Не удалось вернуть стандартную обложку. Попробуйте ещё раз.";
          this.snackbar.error(message);
        }
      });
  }
}
