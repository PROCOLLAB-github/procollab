/** @format */

import { inject, Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { concatMap, filter, fromEvent, Observable, Subject, takeUntil, tap } from "rxjs";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";

type AutosaveField = "presentationAddress" | "coverImageAddress";

interface QueuedPatch {
  projectId: number;
  field: AutosaveField;
  value: string;
}

const QUEUE_KEY = "project-autosave-queue";

@Injectable({ providedIn: "root" })
export class ProjectFormAutosaveService {
  private readonly route = inject(ActivatedRoute);
  private readonly updateFormUseCase = inject(UpdateFormUseCase);

  constructor() {
    // При возврате онлайна сразу проигрываем отложенные изменения.
    fromEvent(window, "online").subscribe(() => this.flushQueue());

    // На случай, если сеть была восстановлена ещё до загрузки приложения.
    if (typeof navigator !== "undefined" && navigator.onLine) {
      this.flushQueue();
    }
  }

  bindDraftCleanupAutosave(
    control: AbstractControl | null,
    field: AutosaveField,
    destroy$: Observable<void> | Subject<void>
  ): void {
    if (!control) return;

    control.valueChanges
      .pipe(
        filter(value => !value),
        concatMap(() => {
          const projectId = Number(this.route.snapshot.params["projectId"]);

          return this.updateFormUseCase
            .execute({
              id: projectId,
              data: { [field]: "", draft: true },
            })
            .pipe(
              tap(result => {
                if (!result.ok && result.error.kind === "network") {
                  this.enqueue({ projectId, field, value: "" });
                }
              })
            );
        }),
        takeUntil(destroy$)
      )
      .subscribe();
  }

  private enqueue(patch: QueuedPatch): void {
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
          })
        )
        .subscribe();
    });
  }

  private readQueue(): QueuedPatch[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedPatch[];
    } catch {
      return [];
    }
  }
}
