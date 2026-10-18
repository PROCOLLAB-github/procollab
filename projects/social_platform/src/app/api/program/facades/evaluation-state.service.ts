/** @format */
import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EvaluationUseCase } from "../use-cases/evaluation.use-case";
import { EvaluationProgram } from "@domain/program/evaluation-workspace.model";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

@Injectable({ providedIn: "root" })
export class EvaluationStateService {
  private readonly api = inject(EvaluationUseCase);
  private readonly profiles = inject(ProfileInfoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly programs = signal<EvaluationProgram[]>([]);
  readonly pending = signal(false);
  readonly failed = signal(false);
  readonly hasAccess = computed(() => this.programs().length > 0);
  private accountId: number | null = null;
  private sequence = 0;
  constructor() {
    effect(() => {
      const id = this.profiles.profile()?.id ?? null;
      untracked(() => {
        if (id === this.accountId) return;
        this.accountId = id;
        this.sequence++;
        this.programs.set([]);
        this.failed.set(false);
        if (id) this.reload();
      });
    });
  }
  reload(): void {
    const sequence = ++this.sequence;
    this.pending.set(true);
    this.failed.set(false);
    this.api
      .programs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (sequence !== this.sequence) return;
          this.programs.set(data.results);
          this.pending.set(false);
        },
        error: () => {
          if (sequence !== this.sequence) return;
          this.failed.set(true);
          this.pending.set(false);
        },
      });
  }
}
