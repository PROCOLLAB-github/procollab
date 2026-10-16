/** @format */

import { ButtonDirective, StateComponent } from "@uilib";
/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  signal,
} from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { DOCUMENT } from "@angular/common";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { ProgramCaseSelection } from "@domain/program/program-case-analytics.model";
import { ProgramAnalyticsInfoService } from "@api/program/facades/detail/program-analytics-info.service";
import { ProgramAnalyticsCaseMetrics } from "@domain/program/program-analytics.model";
import { PluralizePipe } from "@corelib";
import { isFailure, isLoading } from "@domain/shared/async-state";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { exportRegions, RegionExportKind } from "@utils/export-regions";
import { programDeadlines } from "@utils/program-deadlines";
import { AnalyticsDrilldownComponent } from "./drilldown/analytics-drilldown.component";
import { AnalyticsRegionChartComponent } from "./region-chart/region-chart.component";
import { AnalyticsActivityChartComponent } from "./activity-chart/activity-chart.component";
import {
  AnalyticsFunnelChartComponent,
  AnalyticsFunnelStage,
} from "./funnel-chart/funnel-chart.component";
import { ProgramAnalyticsAssignmentScope } from "@domain/program/program-analytics.model";

interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  tooltip: string;
  icon?: string;
  scope?: ProgramAnalyticsAssignmentScope;
}

interface RegionExportState {
  pending: boolean;
  failed: boolean;
}

interface AnalyticsCaseRow extends ProgramAnalyticsCaseMetrics {
  key: string;
  name: string;
  isWithoutCase: boolean;
  totalLabel: string;
  description: string;
  totalPercent: number;
}

/** Внутренняя manager-вкладка с агрегированной аналитикой программы. */
@Component({
  selector: "app-program-analytics",
  templateUrl: "./analytics.component.html",
  styleUrl: "./analytics.component.scss",
  imports: [
    StateComponent,
    ButtonDirective,
    ButtonComponent,
    IconComponent,
    MatProgressBarModule,
    TooltipComponent,
    AnalyticsDrilldownComponent,
    AnalyticsRegionChartComponent,
    AnalyticsActivityChartComponent,
    AnalyticsFunnelChartComponent,
  ],
  providers: [ProgramAnalyticsInfoService, ExportFileInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramAnalyticsComponent implements OnInit {
  private readonly analytics = inject(ProgramAnalyticsInfoService);
  private readonly exports = inject(ExportFileInfoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly currentTime = signal(Date.now());

  protected caseSelection(row: AnalyticsCaseRow): ProgramCaseSelection {
    return row.isWithoutCase
      ? { scope: "without_case" }
      : { scope: "selected", caseName: row.name };
  }
  private readonly pluralize = new PluralizePipe();

  protected readonly data = this.analytics.data;
  protected readonly programId = this.analytics.programId;
  protected readonly programName = this.analytics.programName;
  protected readonly pending = this.analytics.pending;
  protected readonly failed = this.analytics.failed;
  protected readonly error = this.analytics.error;
  protected readonly deadlines = computed(() =>
    programDeadlines(
      this.analytics.scheduleDates(),
      this.data()?.cases.submissionApplicable ?? false,
      new Date(this.currentTime()),
    ),
  );
  protected readonly activeTooltip = signal<string | null>(null);
  protected readonly pinnedTooltip = signal<string | null>(null);
  protected readonly casesExpanded = signal(false);
  protected readonly regionExportState = signal<Record<RegionExportKind, RegionExportState>>({
    "project-regions": { pending: false, failed: false },
    "participant-regions": { pending: false, failed: false },
  });

  protected readonly loadingExports = computed(() => isLoading(this.exports.loadingExports$()));
  protected readonly exportFailed = computed(() => isFailure(this.exports.loadingExports$()));

  protected readonly caseEmptyMessage = computed(() => {
    const cases = this.data()?.cases;
    if (!cases?.configured) return "Кейсы не настроены для этой программы";
    return cases.items.length ? null : "Для программы пока не настроены варианты кейсов";
  });

  /** Preserve backend order/counts; only bar percentages and presentation are derived. */
  protected readonly caseRows = computed<AnalyticsCaseRow[]>(() => {
    const cases = this.data()?.cases;
    if (!cases) return [];
    const rows = cases.items.map((item, index) => ({
      ...item,
      key: `case:${index}`,
      isWithoutCase: false,
    }));
    if (cases.withoutCase.projectsTotal > 0) {
      rows.push({
        ...cases.withoutCase,
        name: "Без выбранного кейса",
        key: "without-case",
        isWithoutCase: true,
      });
    }
    const maxProjects = Math.max(...rows.map(row => row.projectsTotal));
    return rows.map(row => {
      const totalLabel = this.pluralize.transform(row.projectsTotal, [
        "проект",
        "проекта",
        "проектов",
      ]);
      const submission = cases.submissionApplicable ? `, сдано ${row.submitted}` : "";
      return {
        ...row,
        totalLabel,
        description: `${row.name}: ${row.projectsTotal} ${totalLabel}${submission}, участников ${row.participantsTotal}`,
        totalPercent: maxProjects > 0 ? (row.projectsTotal / maxProjects) * 100 : 0,
      };
    });
  });

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
        icon: "person",
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
        key: "submitted-projects",
        label: "Сдано",
        value: overview.solutionFunnel.submitted,
        icon: "analytics-submitted",
        tooltip: "Проекты программы с отправленным решением.",
      },
      {
        key: "participants-per-project",
        label: "Команда",
        value: averageParticipantsPerProject,
        icon: "analytics-team",
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

  protected readonly participantFunnel = computed<AnalyticsFunnelStage[]>(() => {
    const funnel = this.data()?.participantFunnel;
    if (!funnel) return [];

    return [
      {
        ...this.metric(
          "registrations",
          "Зарегистрировались",
          funnel.uniqueParticipants,
          "Уникальные зарегистрированные участники программы.",
        ),
        axisLabel: ["Регистрация"],
      },
      {
        key: "visited",
        label: "Заходили на платформу",
        value: funnel.visitedParticipants ?? null,
        tooltip:
          "Зарегистрированные участники программы, для которых зафиксирован вход или активность на платформе. Учитываются и посещения до регистрации в этой программе.",
        axisLabel: ["Заходили на", "платформу"],
      },
      {
        ...this.metric(
          "with-team",
          "Вступили в команду",
          funnel.withTeam,
          "Зарегистрированные участники, которые сейчас являются руководителями или участниками команды проекта программы.",
        ),
        axisLabel: ["Вступили", "в команду"],
      },
    ];
  });

  protected readonly solutionFunnel = computed<AnalyticsMetric[]>(() => {
    const funnel = this.data()?.solutionFunnel;
    if (!funnel) return [];

    return [
      this.metric("solutions-created", "Создано", funnel.created, "Все проекты программы."),
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

  protected readonly evaluationChartItems = computed<AnalyticsFunnelStage[]>(() =>
    this.evaluationStatuses().map<AnalyticsFunnelStage>(item => ({
      ...item,
      axisLabel: item.key === "evaluation-partial" ? ["Частично", "оценено"] : [item.label],
      tone:
        item.key === "evaluation-submitted"
          ? "muted"
          : item.key === "evaluation-evaluated"
            ? "success"
            : "accent",
    })),
  );

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
    const visit: AnalyticsMetric[] =
      overview.attention.participantsWithoutVisit == null
        ? []
        : [
            {
              key: "without-visit",
              label: "Участники ещё не заходили на платформу",
              value: overview.attention.participantsWithoutVisit,
              tooltip:
                "Зарегистрированные участники программы, у которых ещё не зафиксированы ни вход, ни активность на платформе. Участник исчезает из списка после первого зафиксированного посещения.",
            },
          ];
    return [
      ...visit,
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
          "Появляется за 5 суток до окончания оценивания, если у эксперта есть незавершённая оценка сданной работы. После дедлайна остаётся до завершения оценок. Без даты окончания оценивания сигнал не появляется.",
      },
    ];
  });

  protected readonly hasActivity = computed(() =>
    (this.data()?.activity ?? []).some(
      point => point.registrations > 0 || point.submittedSolutions > 0,
    ),
  );

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
    this.zone.runOutsideAngular(() => {
      const refreshTime = () => this.zone.run(() => this.currentTime.set(Date.now()));
      const timer = setInterval(refreshTime, 60_000);
      const onVisibility = () => {
        if (this.document.visibilityState === "visible") refreshTime();
      };
      this.document.addEventListener("visibilitychange", onVisibility);
      this.destroyRef.onDestroy(() => {
        clearInterval(timer);
        this.document.removeEventListener("visibilitychange", onVisibility);
      });
    });
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

  protected closeTooltip(key: string): void {
    if (this.pinnedTooltip() === key) this.pinnedTooltip.set(null);
    this.hideTooltip(key);
  }

  protected isTooltipVisible(key: string): boolean {
    return this.activeTooltip() === key;
  }

  protected hasValues(metrics: readonly { value: number | null }[]): boolean {
    return metrics.some(item => (item.value ?? 0) > 0);
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
}
