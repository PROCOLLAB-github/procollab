/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, takeUntil } from "rxjs";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import {
  PreviewSolutionAllocationUseCase,
  ApplySolutionAllocationUseCase,
} from "@api/solution/use-cases/solution-evaluation.use-cases";
import { solutionError } from "@api/solution/solution-error";
import { ExpertRow } from "@domain/program/evaluation-workspace.model";
import { SolutionAllocationPlan } from "@domain/solution/solution-contract.model";
import { ButtonDirective, ChoiceDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";

@Component({
  selector: "app-solution-allocation",
  imports: [ButtonDirective, ChoiceDirective, ModalComponent],
  template: `<app-modal
    [open]="!!request()"
    labelledBy="solution-allocation-title"
    (openChange)="!$event && close()"
    ><section class="solution-dialog">
      <header>
        <h2 id="solution-allocation-title">Назначить экспертов</h2>
        <button
          appButton="icon"
          type="button"
          aria-label="Закрыть"
          [disabled]="busy()"
          (click)="close()"
        >
          ×
        </button>
      </header>
      <p>
        Выбрано заявок: {{ request()?.ids?.length }}. Назначения проверяются по кейсам, командам и
        сохраненным оценкам.
      </p>
      @if (loading()) {
        <p role="status">Загружаем экспертов…</p>
      }
      @for (expert of experts(); track expert.id) {
        <label
          ><input
            type="checkbox"
            appChoice
            [checked]="selected().has(+expert.id)"
            [disabled]="busy()"
            (change)="toggle(+expert.id)"
          />{{ expert.name || expert.email }}</label
        >
      }
      @if (!loading() && !experts().length && !error()) {
        <p>В программе пока нет принявших приглашение экспертов.</p>
      }
      @if (error()) {
        <p role="alert">{{ error() }}</p>
        <button appButton="secondary" type="button" [disabled]="busy()" (click)="load()">
          Обновить данные
        </button>
      }
      @if (plan(); as checked) {
        <h3>Будет добавлено назначений: {{ checked.assignments.length }}</h3>
        @for (shortage of checked.shortages; track shortage.solutionId) {
          <p>{{ shortage.solutionName }}: не хватает экспертов — {{ shortage.missing }}.</p>
        }
        @for (row of checked.load; track row.expertId) {
          <p>{{ row.name }}: {{ row.before }} → {{ row.after }} работ.</p>
        }
      }
      <footer>
        <button appButton="secondary" type="button" [disabled]="busy()" (click)="close()">
          Отмена
        </button>
        @if (plan()) {
          <button
            appButton="primary"
            type="button"
            [disabled]="busy() || !!plan()?.shortages?.length"
            (click)="confirm()"
          >
            Подтвердить назначения
          </button>
        } @else {
          <button
            appButton="primary"
            type="button"
            [disabled]="loading() || busy() || !selected().size || !revision()"
            (click)="preview()"
          >
            Проверить назначения
          </button>
        }
      </footer>
    </section></app-modal
  >`,
  styleUrl: "./solution-applications.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionAllocationComponent {
  readonly request = input<{ programId: number; ids: number[] } | null>(null);
  readonly closed = output<void>();
  readonly completed = output<void>();
  readonly busyChange = output<boolean>();
  readonly experts = signal<ExpertRow[]>([]);
  readonly selected = signal(new Set<number>());
  readonly revision = signal("");
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly plan = signal<SolutionAllocationPlan | null>(null);
  private readonly roster = inject(EvaluationUseCase);
  private readonly getPlan = inject(PreviewSolutionAllocationUseCase);
  private readonly apply = inject(ApplySolutionAllocationUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelled = new Subject<void>();
  constructor() {
    effect(() => {
      const request = this.request();
      untracked(() => {
        this.cancelled.next();
        this.experts.set([]);
        this.selected.set(new Set());
        this.revision.set("");
        this.plan.set(null);
        this.error.set(null);
        if (request) this.load();
      });
    });
  }
  load(): void {
    const request = this.request();
    if (!request || this.busy()) return;
    this.cancelled.next();
    this.loading.set(true);
    this.plan.set(null);
    this.revision.set("");
    this.error.set(null);
    // Existing workspace supplies only the expert roster and revision here; Project IDs and counters are never consumed.
    this.roster
      .workspace(request.programId)
      .pipe(takeUntil(this.cancelled), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.experts.set(
            data.experts.filter(e => e.status === "joined" && typeof e.id === "number"),
          );
          this.revision.set(data.revision);
          this.loading.set(false);
          this.selected.update(
            ids => new Set([...ids].filter(id => this.experts().some(e => e.id === id))),
          );
        },
        error: error => {
          this.loading.set(false);
          this.error.set(solutionError(error).detail);
        },
      });
  }
  toggle(id: number): void {
    if (this.busy()) return;
    this.cancelled.next();
    this.loading.set(false);
    this.plan.set(null);
    this.selected.update(ids => {
      const next = new Set(ids);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  preview(): void {
    const request = this.request();
    if (!request || !this.selected().size || !this.revision() || this.busy()) return;
    this.cancelled.next();
    this.loading.set(true);
    this.error.set(null);
    this.plan.set(null);
    this.getPlan
      .execute(request.programId, {
        revision: this.revision(),
        expertIds: [...this.selected()],
        solutionIds: request.ids,
      })
      .pipe(takeUntil(this.cancelled), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.loading.set(false);
        if (result.ok) this.plan.set(result.value);
        else this.error.set(result.error.detail);
      });
  }
  confirm(): void {
    const request = this.request(),
      plan = this.plan();
    if (!request || !plan?.planToken || plan.shortages.length || this.busy()) return;
    this.busy.set(true);
    this.busyChange.emit(true);
    this.apply
      .execute(request.programId, plan.planToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.busy.set(false);
        this.busyChange.emit(false);
        this.plan.set(null);
        if (this.request() !== request) return;
        if (result.ok) this.completed.emit();
        else this.error.set(result.error.detail);
      });
  }
  close(): void {
    if (this.busy()) return;
    this.cancelled.next();
    this.closed.emit();
  }
}
