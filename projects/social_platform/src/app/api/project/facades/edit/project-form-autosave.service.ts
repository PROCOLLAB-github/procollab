/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { concatMap, filter, fromEvent, map, tap } from "rxjs";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SnackbarService } from "@domain/shared/snackbar.service";

type AutosaveField = "presentationAddress" | "coverImageAddress";

interface QueuedPatch {
  projectId: number;
  field: AutosaveField;
  value: string;
}

const QUEUE_KEY = "project-autosave-queue";

/** Автосохраняет очистку файловых полей, повторяет при сетевой ошибке. */
@Injectable({ providedIn: "root" })
export class ProjectFormAutosaveService {
  private readonly updateFormUseCase = inject(UpdateFormUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackbar = inject(SnackbarService);

  constructor() {
    // При возврате онлайна сразу проигрываем отложенные изменения.
    fromEvent(window, "online")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.flushQueue());

    // На случай, если сеть была восстановлена ещё до загрузки приложения.
    if (typeof navigator !== "undefined" && navigator.onLine) {
      this.flushQueue();
    }
  }

  /**
   * Сохраняет пользовательскую очистку в контексте загруженного проекта формы.
   * Инициализация файловых контролов должна выполняться с emitEvent: false.
   * ID фиксируется при изменении, до concatMap: ожидание предыдущего запроса
   * и переход редактора к другому проекту не должны менять адрес назначения.
   */
  bindDraftCleanupAutosave(
    control: AbstractControl | null,
    field: AutosaveField,
    destroyRef: DestroyRef,
    projectId: () => number | null,
  ): void {
    if (!control) return;

    control.valueChanges
      .pipe(
        filter(value => value === ""),
        map(value => ({ projectId: projectId(), field, value })),
        filter((patch): patch is QueuedPatch => this.isQueuedPatch(patch)),
        concatMap(patch => {
          return this.updateFormUseCase
            .execute({
              id: patch.projectId,
              data: { [field]: "", draft: true },
            })
            .pipe(
              tap(result => {
                if (!result.ok && result.error.kind === "network") {
                  this.enqueue(patch);
                  this.snackbar.error(
                    "Очистка ссылки на файл ещё не сохранена. Повторим при восстановлении сети.",
                  );
                } else if (!result.ok) {
                  this.snackbar.error(
                    "Не удалось сохранить очистку ссылки на файл. Повторите сохранение черновика.",
                  );
                }
              }),
            );
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe();
  }

  private enqueue(patch: QueuedPatch): void {
    if (!this.isQueuedPatch(patch)) return;
    const queue = this.readQueue();
    // Дедуп по (projectId, field) — последняя запись побеждает.
    const dedup = queue.filter(q => !(q.projectId === patch.projectId && q.field === patch.field));
    dedup.push(patch);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(dedup));
  }

  private flushQueue(): void {
    const queue = this.readQueue();
    if (queue.length === 0) return;

    // Очищаем сразу — провалившиеся повторно вернутся через enqueue.
    localStorage.removeItem(QUEUE_KEY);

    queue.forEach(({ projectId, field, value }) => {
      this.updateFormUseCase
        .execute({ id: projectId, data: { [field]: value, draft: true } })
        .pipe(
          tap(result => {
            if (!result.ok && result.error.kind === "network") {
              this.enqueue({ projectId, field, value });
            }
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    });
  }

  private readQueue(): QueuedPatch[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
      const queue = Array.isArray(stored) ? stored.filter(this.isQueuedPatch) : [];
      // Старые записи с NaN превращались в null при JSON.stringify. Удаляем
      // повреждённые записи из хранилища до любого повтора запроса.
      if (!Array.isArray(stored) || queue.length !== stored.length) {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      }
      return queue;
    } catch {
      return [];
    }
  }

  private isQueuedPatch(value: unknown): value is QueuedPatch {
    if (!value || typeof value !== "object") return false;
    const patch = value as Partial<QueuedPatch>;
    return (
      typeof patch.projectId === "number" &&
      Number.isSafeInteger(patch.projectId) &&
      patch.projectId > 0 &&
      (patch.field === "presentationAddress" || patch.field === "coverImageAddress") &&
      typeof patch.value === "string"
    );
  }
}
