/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { ProgramAnalyticsInfoService } from "@api/program/facades/detail/program-analytics-info.service";
import { isFailure, isLoading } from "@domain/shared/async-state";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";

interface AnalyticsMetric {
  key: string;
  label: string;
  value: number | string;
  tooltip: string;
  icon?: string;
}

/** Внутренняя manager-вкладка с агрегированной аналитикой программы. */
@Component({
  selector: "app-program-analytics",
  templateUrl: "./analytics.component.html",
  styleUrl: "./analytics.component.scss",
  imports: [ButtonComponent, IconComponent, MatProgressBarModule, TooltipComponent],
  providers: [ProgramAnalyticsInfoService, ExportFileInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramAnalyticsComponent implements OnInit {
  private readonly analytics = inject(ProgramAnalyticsInfoService);
  private readonly exports = inject(ExportFileInfoService);

  protected readonly data = this.analytics.data;
  protected readonly pending = this.analytics.pending;
  protected readonly failed = this.analytics.failed;
  protected readonly error = this.analytics.error;
  protected readonly activeTooltip = signal<string | null>(null);
  protected readonly pinnedTooltip = signal<string | null>(null);

  protected readonly loadingExports = computed(() => isLoading(this.exports.loadingExports$()));
  protected readonly exportFailed = computed(() => isFailure(this.exports.loadingExports$()));

  protected readonly summary = computed<AnalyticsMetric[]>(() => {
    const data = this.data();
    if (!data) return [];

    return [
      {
        key: "participants",
        label: "Участники",
        value: data.overview.participants.total,
        icon: "team",
        tooltip: "Уникальные пользователи, зарегистрированные в программе.",
      },
      {
        key: "projects",
        label: "Проекты",
        value: data.projectCount ?? "—",
        icon: "folder",
        tooltip:
          data.projectCount === null
            ? "Количество проектов временно недоступно."
            : "Все проекты, связанные с программой.",
      },
      {
        key: "experts",
        label: "Назначения экспертов",
        value: data.overview.expertAssignments.total,
        icon: "person",
        tooltip: "Все назначения экспертов на решения программы.",
      },
      {
        key: "regions",
        label: "Регионы проектов",
        value: "—",
        icon: "world-wide",
        tooltip: "Разрез по уникальным регионам пока недоступен.",
      },
    ];
  });

  protected readonly participantFunnel = computed<AnalyticsMetric[]>(() => {
    const overview = this.data()?.overview;
    if (!overview) return [];
    return [
      this.metric("registrations", "Зарегистрировались", overview.registrations.total),
      this.metric("participants-total", "Уникальные участники", overview.participants.total),
      this.metric("applications", "Создали заявку", overview.applications.total),
      this.metric("team-members", "Приняты в команды", overview.teams.acceptedMembers),
      this.metric(
        "submitted-applications",
        "Отправили решение",
        overview.submissions.applicationsWithSubmittedSolution,
      ),
    ];
  });

  protected readonly solutionFunnel = computed<AnalyticsMetric[]>(() => {
    const overview = this.data()?.overview;
    if (!overview) return [];
    return [
      this.metric("solutions-created", "Создано версий", overview.submissions.total),
      this.metric("solutions-draft", "Черновик", overview.submissions.byStatus.draft),
      this.metric(
        "solutions-submitted",
        "Сдано заявок",
        overview.submissions.applicationsWithSubmittedSolution,
      ),
      this.metric("solutions-evaluated", "Оценено", overview.evaluations.byStatus.submitted),
    ];
  });

  protected readonly evaluationStatuses = computed<AnalyticsMetric[]>(() => {
    const overview = this.data()?.overview;
    if (!overview) return [];
    return [
      this.metric(
        "assignments-assigned",
        "Назначено",
        overview.expertAssignments.byStatus.assigned,
      ),
      this.metric("evaluations-draft", "На проверке", overview.evaluations.byStatus.draft),
      this.metric("evaluations-submitted", "Оценено", overview.evaluations.byStatus.submitted),
      this.metric(
        "assignments-revoked",
        "Назначение отозвано",
        overview.expertAssignments.byStatus.revoked,
      ),
    ];
  });

  protected readonly attention = computed<AnalyticsMetric[]>(() => {
    const overview = this.data()?.overview;
    if (!overview) return [];
    return [
      {
        key: "without-team",
        label: "Участники вне принятых команд",
        value: Math.max(overview.participants.total - overview.teams.acceptedMembers, 0),
        tooltip:
          "Уникальные участники за вычетом принятых участников команд. Индивидуальные участники также входят в это число.",
      },
      {
        key: "awaiting-evaluation",
        label: "Решения ожидают оценивания",
        value: overview.submissions.byStatus.submitted,
        tooltip: "Версии решений, находящиеся в статусе «сдано».",
      },
    ];
  });

  protected readonly activity = computed<AnalyticsMetric[]>(() => {
    const overview = this.data()?.overview;
    if (!overview) return [];
    return [
      {
        key: "activity-registrations",
        label: "Новые регистрации",
        value: overview.registrations.total,
        tooltip: "Накопленное количество регистрационных записей программы.",
      },
      {
        key: "activity-submissions",
        label: "Отправленные решения",
        value: overview.submissions.applicationsWithSubmittedSolution,
        tooltip: "Заявки, по которым отправлено хотя бы одно решение.",
      },
    ];
  });

  protected readonly allMetricsEmpty = computed(() => {
    const overview = this.data()?.overview;
    if (!overview) return false;
    return (
      overview.registrations.total === 0 &&
      overview.applications.total === 0 &&
      overview.submissions.total === 0 &&
      overview.evaluations.total === 0 &&
      (this.data()?.projectCount ?? 0) === 0
    );
  });

  protected readonly errorMessage = computed(() => {
    switch (this.error()?.kind) {
      case "forbidden":
        return "У вас нет доступа к аналитике этой программы.";
      case "not_found":
        return "Программа не найдена.";
      case "unauthorized":
        return "Авторизуйтесь заново, чтобы открыть аналитику.";
      default:
        return "Не удалось загрузить аналитику. Проверьте соединение и повторите попытку.";
    }
  });

  ngOnInit(): void {
    this.analytics.initialize();
  }

  protected retry(): void {
    this.analytics.retry();
  }

  protected showTooltip(key: string): void {
    this.activeTooltip.set(key);
  }

  protected hideTooltip(key: string): void {
    if (this.activeTooltip() === key && this.pinnedTooltip() !== key) {
      this.activeTooltip.set(null);
    }
  }

  protected toggleTooltip(key: string): void {
    const shouldClose = this.pinnedTooltip() === key;
    this.pinnedTooltip.set(shouldClose ? null : key);
    this.activeTooltip.set(shouldClose ? null : key);
  }

  protected isTooltipVisible(key: string): boolean {
    return this.activeTooltip() === key;
  }

  protected barWidth(value: number | string, metrics: AnalyticsMetric[]): number {
    if (typeof value !== "number") return 0;
    const max = Math.max(...metrics.map(item => (typeof item.value === "number" ? item.value : 0)));
    return max > 0 ? Math.max((value / max) * 100, value > 0 ? 8 : 0) : 0;
  }

  protected hasValues(metrics: AnalyticsMetric[]): boolean {
    return metrics.some(item => typeof item.value === "number" && item.value > 0);
  }

  protected downloadProjects(): void {
    this.exports.downloadProjects();
  }

  protected downloadSubmittedProjects(): void {
    this.exports.downloadSubmittedProjects();
  }

  protected downloadRates(): void {
    this.exports.downloadRates();
  }

  private metric(key: string, label: string, value: number): AnalyticsMetric {
    return { key, label, value, tooltip: label };
  }
}
