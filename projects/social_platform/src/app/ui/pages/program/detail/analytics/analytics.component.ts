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
import { ProgramAnalyticsActivityPoint } from "@domain/program/program-analytics.model";
import { isFailure, isLoading } from "@domain/shared/async-state";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { exportRegions, RegionExportKind } from "@utils/export-regions";
import { AnalyticsDrilldownComponent } from "./drilldown/analytics-drilldown.component";
import { ProgramAnalyticsAssignmentScope } from "@domain/program/program-analytics.model";

interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  tooltip: string;
  icon?: string;
  scope?: ProgramAnalyticsAssignmentScope;
}

interface ActivityChartPoint extends ProgramAnalyticsActivityPoint {
  dateLabel: string;
  x: number;
  registrationsY: number;
  submittedSolutionsY: number;
}

interface RegionExportState {
  pending: boolean;
  failed: boolean;
}

/** Внутренняя manager-вкладка с агрегированной аналитикой программы. */
@Component({
  selector: "app-program-analytics",
  templateUrl: "./analytics.component.html",
  styleUrl: "./analytics.component.scss",
  imports: [
    ButtonComponent,
    IconComponent,
    MatProgressBarModule,
    TooltipComponent,
    AnalyticsDrilldownComponent,
  ],
  providers: [ProgramAnalyticsInfoService, ExportFileInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramAnalyticsComponent implements OnInit {
  private readonly analytics = inject(ProgramAnalyticsInfoService);
  private readonly exports = inject(ExportFileInfoService);

  protected readonly data = this.analytics.data;
  protected readonly programId = this.analytics.programId;
  protected readonly pending = this.analytics.pending;
  protected readonly failed = this.analytics.failed;
  protected readonly error = this.analytics.error;
  protected readonly activeTooltip = signal<string | null>(null);
  protected readonly pinnedTooltip = signal<string | null>(null);
  protected readonly selectedActivityDate = signal<string | null>(null);
  protected readonly regionExportState = signal<Record<RegionExportKind, RegionExportState>>({
    "project-regions": { pending: false, failed: false },
    "participant-regions": { pending: false, failed: false },
  });

  protected readonly loadingExports = computed(() => isLoading(this.exports.loadingExports$()));
  protected readonly exportFailed = computed(() => isFailure(this.exports.loadingExports$()));

  protected readonly summary = computed<AnalyticsMetric[]>(() => {
    const overview = this.data();
    if (!overview) return [];
    const projectCount = overview.summary.projects.total;
    const averageParticipantsPerProject =
      projectCount > 0
        ? Math.round((overview.summary.participants.total / projectCount) * 10) / 10
        : 0;

    return [
      {
        key: "participants",
        label: "Участники",
        value: overview.summary.participants.total,
        icon: "team",
        tooltip: "Уникальные пользователи, зарегистрированные в программе.",
      },
      {
        key: "projects",
        label: "Проекты",
        value: overview.summary.projects.total,
        icon: "folder",
        tooltip: "Все проекты, связанные с программой.",
      },
      {
        key: "experts",
        label: "Эксперты",
        value: overview.summary.experts.total,
        icon: "person",
        tooltip: "Эксперты, добавленные в программу.",
      },
      {
        key: "participants-per-project",
        label: "Команда",
        value: averageParticipantsPerProject,
        icon: "people",
        tooltip: "Среднее количество зарегистрированных участников программы на один проект.",
      },
    ];
  });

  protected readonly regionCards = computed(() => [
    {
      key: "project-regions" as const,
      title: "Регионы проектов",
      items: this.data()?.summary.regions.items ?? [],
      tooltip: "Количество проектов по регионам, указанным в карточках проектов программы.",
      emptyMessage: "У проектов пока не указаны регионы",
    },
    {
      key: "participant-regions" as const,
      title: "Регионы участников",
      items: this.data()?.summary.participantRegions.items ?? [],
      tooltip: "Количество участников программы по региону, указанному в профиле.",
      emptyMessage: "У участников пока не указаны регионы",
    },
  ]);

  protected readonly participantFunnel = computed<AnalyticsMetric[]>(() => {
    const funnel = this.data()?.participantFunnel;
    if (!funnel) return [];

    return [
      this.metric(
        "registrations",
        "Зарегистрировались",
        funnel.registrations,
        "Все регистрационные записи программы, включая сохранённые записи удалённых пользователей.",
      ),
      this.metric(
        "unique-participants",
        "Уникальные участники",
        funnel.uniqueParticipants,
        "Уникальные пользователи среди регистрационных записей программы.",
      ),
      this.metric(
        "with-team",
        "В команде",
        funnel.withTeam,
        "Участники, которые являются руководителями или участниками команды проекта программы.",
      ),
      this.metric(
        "project-creators",
        "Создали проект",
        funnel.projectCreators,
        "Участники, ставшие руководителями проекта программы.",
      ),
      this.metric(
        "submitted-project-creators",
        "Сдали проект",
        funnel.submittedProjectCreators,
        "Руководители проектов, отправившие решение программы.",
      ),
    ];
  });

  protected readonly solutionFunnel = computed<AnalyticsMetric[]>(() => {
    const funnel = this.data()?.solutionFunnel;
    if (!funnel) return [];

    return [
      this.metric("solutions-created", "Создано", funnel.created, "Все проекты программы."),
      this.metric(
        "solutions-not-submitted",
        "Черновик / не сдано",
        funnel.notSubmitted,
        "Проекты программы, решение по которым ещё не отправлено.",
      ),
      this.metric(
        "solutions-submitted",
        "Сдано",
        funnel.submitted,
        "Проекты с отправленным решением.",
      ),
      this.metric(
        "solutions-evaluated",
        "Оценено",
        funnel.evaluated,
        "Сданные проекты, признанные оценёнными по режиму программы.",
      ),
    ];
  });

  protected readonly evaluationStatuses = computed<AnalyticsMetric[]>(() => {
    const status = this.data()?.evaluationStatus;
    if (!status) return [];

    const metrics = [
      this.metric(
        "evaluation-submitted",
        "Сдано",
        status.projects.submitted,
        "Все проекты с отправленным решением.",
      ),
      this.metric(
        "evaluation-awaiting",
        "Ожидают оценивания",
        status.projects.awaitingEvaluation,
        this.awaitingEvaluationTooltip(status.mode),
      ),
    ];

    if (status.mode === "distributed") {
      metrics.push(
        this.metric(
          "evaluation-partial",
          "Частично оценено",
          status.projects.partiallyEvaluated,
          "Хотя бы один назначенный эксперт полностью оценил проект, но не все назначенные эксперты завершили оценивание.",
        ),
      );
    }

    metrics.push(
      this.metric(
        "evaluation-evaluated",
        "Оценено",
        status.projects.evaluated,
        status.mode === "open"
          ? "Проекты, получившие хотя бы одну оценку эксперта."
          : "Проекты, по которым выполнены все назначения экспертов.",
      ),
    );
    return metrics;
  });

  protected readonly assignmentStatuses = computed<AnalyticsMetric[]>(() => {
    const assignments = this.data()?.evaluationStatus.assignments;
    if (!assignments) return [];
    return [
      { ...this.metric("assignments-total", "Назначений всего", assignments.total), scope: "all" },
      {
        ...this.metric("assignments-evaluated", "Выполнено", assignments.evaluated),
        scope: "completed",
      },
      { ...this.metric("assignments-pending", "Ожидает", assignments.pending), scope: "pending" },
    ];
  });

  protected readonly evaluationModeLabel = computed(() =>
    this.data()?.evaluationStatus.mode === "distributed"
      ? "Распределённое оценивание"
      : "Открытое оценивание",
  );

  protected readonly attention = computed<AnalyticsMetric[]>(() => {
    const overview = this.data();
    if (!overview) return [];
    return [
      {
        key: "without-team",
        label: "Участники без команды",
        value: overview.attention.participantsWithoutTeam,
        tooltip:
          "Зарегистрированные участники, которые не являются руководителями или участниками команды проекта программы.",
      },
      {
        key: "awaiting-evaluation",
        label: "Работы ожидают оценивания",
        value: overview.attention.projectsAwaitingEvaluation,
        tooltip: this.awaitingEvaluationTooltip(overview.evaluationStatus.mode),
      },
      {
        key: "delayed-experts",
        label: "Эксперты задерживают оценивание",
        value: overview.attention.delayedExperts.total,
        tooltip:
          "Эксперты с просроченными назначениями: минимум два проекта ожидают оценки 24 часа или хотя бы один проект — 48 часов.",
      },
    ];
  });

  protected readonly hasActivity = computed(() =>
    (this.data()?.activity ?? []).some(
      point => point.registrations > 0 || point.submittedSolutions > 0,
    ),
  );

  protected readonly activityScale = computed(() => {
    const activity = this.data()?.activity ?? [];
    const maximum = Math.max(
      1,
      ...activity.flatMap(point => [point.registrations, point.submittedSolutions]),
    );
    // Integer counts, shared zero-based scale for both series; at most five grid labels.
    const step = Math.max(1, Math.ceil(maximum / 4));
    return { maximum: step * 4, ticks: [4, 3, 2, 1, 0].map(index => index * step) };
  });

  protected readonly activityChart = computed<ActivityChartPoint[]>(() => {
    const activity = this.data()?.activity ?? [];
    const maxValue = this.activityScale().maximum;
    const divisor = Math.max(activity.length - 1, 1);

    return activity.map((point, index) => ({
      ...point,
      dateLabel: this.formatDate(point.date),
      x: 3 + (index / divisor) * 94,
      registrationsY: 88 - (point.registrations / maxValue) * 76,
      submittedSolutionsY: 88 - (point.submittedSolutions / maxValue) * 76,
    }));
  });

  protected readonly registrationPolyline = computed(() =>
    this.activityChart()
      .map(point => `${point.x},${point.registrationsY}`)
      .join(" "),
  );

  protected readonly submissionPolyline = computed(() =>
    this.activityChart()
      .map(point => `${point.x},${point.submittedSolutionsY}`)
      .join(" "),
  );

  protected readonly activityAxisLabels = computed(() => {
    const points = this.activityChart();
    const interval = Math.max(1, Math.ceil((points.length - 1) / 3));
    return points.filter((_, index) => index % interval === 0 || index === points.length - 1);
  });

  protected readonly selectedActivity = computed(() =>
    this.activityChart().find(point => point.date === this.selectedActivityDate()),
  );

  protected activityPointLabel(point: ActivityChartPoint): string {
    return `${point.dateLabel}: новые регистрации — ${point.registrations}, отправленные решения — ${point.submittedSolutions}`;
  }

  protected async downloadRegions(kind: RegionExportKind): Promise<void> {
    const card = this.regionCards().find(item => item.key === kind);
    if (!card?.items.length || this.regionExportState()[kind].pending) return;
    this.regionExportState.update(state => ({
      ...state,
      [kind]: { pending: true, failed: false },
    }));
    try {
      await exportRegions(kind, card.items);
      this.regionExportState.update(state => ({
        ...state,
        [kind]: { pending: false, failed: false },
      }));
    } catch {
      this.regionExportState.update(state => ({
        ...state,
        [kind]: { pending: false, failed: true },
      }));
    }
  }

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

  protected barWidth(value: number, metrics: AnalyticsMetric[]): number {
    const max = Math.max(...metrics.map(item => item.value));
    return max > 0 ? Math.max((value / max) * 100, value > 0 ? 8 : 0) : 0;
  }

  protected hasValues(metrics: AnalyticsMetric[]): boolean {
    return metrics.some(item => item.value > 0);
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

  private metric(key: string, label: string, value: number, tooltip = label): AnalyticsMetric {
    return { key, label, value, tooltip };
  }

  private awaitingEvaluationTooltip(mode: "open" | "distributed"): string {
    return mode === "open"
      ? "Сданные проекты, которые ещё не получили ни одной оценки эксперта."
      : "Сданные проекты без выполненных назначений или с выполненной только частью назначений.";
  }

  private formatDate(date: string): string {
    const [, month = "", day = ""] = date.split("-");
    return `${day}.${month}`;
  }
}
