/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { ButtonDirective } from "@uilib";
import { IconComponent } from "@ui/primitives";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentScope,
  ProgramAnalyticsError,
  ProgramAnalyticsOverview,
} from "@domain/program/program-analytics.model";
import {
  AsyncState,
  failure,
  initial,
  isFailure,
  isLoading,
  isSuccess,
  loading,
  success,
} from "@domain/shared/async-state";

interface ExpertProgress {
  id: number;
  name: string;
  total: number;
  completed: number;
}

@Component({
  selector: "app-analytics-evaluation-progress",
  imports: [ButtonDirective, IconComponent],
  templateUrl: "./evaluation-progress.component.html",
  styleUrl: "./evaluation-progress.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsEvaluationProgressComponent {
  readonly programId = input<number | null>(null);
  readonly status = input.required<ProgramAnalyticsOverview["evaluationStatus"]>();
  readonly openAssignments = output<{
    scope: ProgramAnalyticsAssignmentScope;
    trigger: HTMLElement;
  }>();
  private readonly getAssignments = inject(GetProgramManagerAssignmentsUseCase);
  private readonly refresh = signal(0);
  private readonly expertState =
    signal<AsyncState<ProgramAnalyticsAssignment[], ProgramAnalyticsError>>(initial());

  protected readonly totals = computed(() => this.status().assignments);
  protected readonly percentage = computed(() => {
    const { total, evaluated } = this.totals();
    return total > 0 ? (evaluated / total) * 100 : null;
  });
  // Never display 100% while an assignment is still unfinished.
  protected readonly percentageLabel = computed(() => Math.floor(this.percentage() ?? 0));
  protected readonly pending = computed(() => isLoading(this.expertState()));
  protected readonly failed = computed(() => isFailure(this.expertState()));
  protected readonly experts = computed(() => {
    const state = this.expertState();
    if (!isSuccess(state)) return [];
    const groups = new Map<number, ExpertProgress>();
    for (const assignment of state.data) {
      const expert = assignment.expert;
      const row = groups.get(expert.expertId) ?? {
        id: expert.expertId,
        name:
          expert.fullName ||
          [expert.firstName, expert.lastName].filter(Boolean).join(" ") ||
          "Имя не указано",
        total: 0,
        completed: 0,
      };
      row.total++;
      row.completed += Number(assignment.status === "completed");
      groups.set(row.id, row);
    }
    return [...groups.values()]
      .sort(
        (a, b) =>
          b.total - b.completed - (a.total - a.completed) ||
          a.name.localeCompare(b.name, "ru") ||
          a.id - b.id,
      )
      .slice(0, 3);
  });

  constructor() {
    effect(onCleanup => {
      this.refresh();
      const id = this.programId();
      const total = this.totals().total;
      this.expertState.set(initial());
      if (id === null || total === 0) return;
      this.expertState.set(loading());
      const request = this.getAssignments.execute(id, "all").subscribe(result => {
        this.expertState.set(result.ok ? success(result.value) : failure(result.error));
      });
      onCleanup(() => request.unsubscribe());
    });
  }

  protected retryExperts(): void {
    this.refresh.update(value => value + 1);
  }
}
