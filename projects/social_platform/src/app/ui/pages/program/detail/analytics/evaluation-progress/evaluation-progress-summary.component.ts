/** @format */
import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { ButtonDirective, IconComponent } from "@uilib";

// Только представление счетчиков: V1/V2 самостоятельно получают назначения из своих API.
@Component({
  selector: "app-evaluation-progress-summary",
  imports: [ButtonDirective, IconComponent],
  templateUrl: "./evaluation-progress-summary.component.html",
  styleUrl: "./evaluation-progress-summary.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationProgressSummaryComponent {
  readonly totals = input.required<{ total: number; evaluated: number; pending: number }>();
  readonly mode = input<string | null>(null);
  readonly showEmptyAction = input(false);
  readonly openAssignments = output<{
    scope: "all" | "completed" | "pending";
    trigger: HTMLElement;
  }>();
  protected readonly percentage = computed(() => {
    const { total, evaluated } = this.totals();
    return total > 0 ? (evaluated / total) * 100 : null;
  });
  // Незавершенные назначения не округляются до 100%.
  protected readonly percentageLabel = computed(() => Math.floor(this.percentage() ?? 0));
}
