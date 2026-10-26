/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { Observable, Subject, takeUntil, timer } from "rxjs";
import { CdkMenuModule } from "@angular/cdk/menu";
import { IconComponent } from "@ui/primitives/icon/icon.component";
import { AnalyticsActivityChartComponent } from "./activity-chart/activity-chart.component";
import { Result } from "@domain/shared/result.type";
import { saveAs } from "file-saver";
import { A11yModule } from "@angular/cdk/a11y";
import { ButtonDirective, ChoiceDirective, FieldDirective, TableDirective } from "@uilib";
import { AppRoutes } from "@api/paths/app-routes";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { AnalyticsFunnelChartComponent } from "./funnel-chart/funnel-chart.component";
import { AnalyticsRegionChartComponent } from "./region-chart/region-chart.component";
import { programDeadlines, ProgramScheduleDates } from "@utils/program-deadlines";
import {
  GetSolutionManagerAnalyticsUseCase,
  GetSolutionManagerSolutionsUseCase,
  GetSolutionManagerAssignmentsUseCase,
  GetSolutionManagerAssignmentUseCase,
  ExportSolutionAnalyticsUseCase,
  PreviewSolutionExpertReminderUseCase,
  ConfirmSolutionExpertReminderUseCase,
} from "@api/solution/use-cases/solution-manager-analytics.use-cases";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerParticipantsWithoutVisitUseCase } from "@api/program/use-cases/get-program-manager-participants-without-visit.use-case";
import { ProgramAttentionActionsUseCase } from "@api/program/use-cases/program-attention-actions.use-case";
import { ProgramAnalyticsAttentionParticipant } from "@domain/program/program-analytics-attention.model";
import {
  SolutionManagerAnalytics,
  SolutionManagerSolutions,
  SolutionManagerAssignment,
  SolutionManagerAssignmentDetail,
  SolutionReminderPreview,
} from "@domain/solution/solution-contract.model";
import { SolutionManagerSolutionFilters } from "@domain/solution/ports/solution.repository.port";
import { ProgramAttentionPreview } from "@domain/program/program-attention-actions.model";
import {
  assignmentCriterionValue,
  assignmentStatusLabels,
} from "@utils/program-analytics-assignment";

type View =
  | "solutions"
  | "assignments"
  | "participants-without-team"
  | "participants-without-visit";
@Component({
  selector: "app-solution-analytics",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    A11yModule,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    TableDirective,
    ModalComponent,
    AnalyticsFunnelChartComponent,
    AnalyticsRegionChartComponent,
    AnalyticsActivityChartComponent,
    CdkMenuModule,
    IconComponent,
  ],
  templateUrl: "./solution-analytics.component.html",
  styleUrls: ["./analytics.component.scss", "./solution-analytics.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionAnalyticsComponent {
  readonly programId = input.required<number>();
  readonly dates = input<ProgramScheduleDates | null>(null);
  private readonly overviewApi = inject(GetSolutionManagerAnalyticsUseCase);
  private readonly solutionsApi = inject(GetSolutionManagerSolutionsUseCase);
  private readonly assignmentsApi = inject(GetSolutionManagerAssignmentsUseCase);
  private readonly detailApi = inject(GetSolutionManagerAssignmentUseCase);
  private readonly exportApi = inject(ExportSolutionAnalyticsUseCase);
  private readonly previewApi = inject(PreviewSolutionExpertReminderUseCase);
  private readonly confirmApi = inject(ConfirmSolutionExpertReminderUseCase);
  private readonly withoutTeam = inject(GetProgramManagerParticipantsWithoutTeamUseCase);
  private readonly withoutVisit = inject(GetProgramManagerParticipantsWithoutVisitUseCase);
  private readonly participantActions = inject(ProgramAttentionActionsUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancel = new Subject<void>();
  private readonly cancelList = new Subject<void>();
  private readonly cancelAction = new Subject<void>();
  private readonly cancelDetail = new Subject<void>();
  private readonly cancelExport = new Subject<void>();
  private trigger: HTMLElement | null = null;
  readonly data = signal<SolutionManagerAnalytics | null>(null);
  readonly pending = signal(false);
  readonly error = signal("");
  readonly exporting = signal(false);
  readonly exportError = signal("");
  readonly modal = signal<View | null>(null);
  readonly title = signal("");
  readonly query = signal<SolutionManagerSolutionFilters>({});
  readonly search = new FormControl("", { nonNullable: true });
  readonly appliedSearch = signal("");
  readonly offset = signal(0);
  readonly list = signal<SolutionManagerSolutions | null>(null);
  readonly participants = signal<ProgramAnalyticsAttentionParticipant[]>([]);
  readonly participantCount = signal(0);
  readonly assignments = signal<SolutionManagerAssignment[]>([]);
  readonly assignmentScope = signal<"all" | "completed" | "pending">("all");
  readonly selectedExpert = signal<number | null>(null);
  readonly detail = signal<SolutionManagerAssignmentDetail | null>(null);
  readonly listPending = signal(false);
  readonly listError = signal("");
  readonly detailPending = signal(false);
  readonly detailError = signal("");
  readonly selection = signal<{ mode: "selected" | "all"; ids: number[]; excludedIds: number[] }>({
    mode: "selected",
    ids: [],
    excludedIds: [],
  });
  readonly preview = signal<SolutionReminderPreview | ProgramAttentionPreview | null>(null);
  readonly actionPending = signal(false);
  readonly actionError = signal("");
  readonly message = signal("");
  readonly paths = AppRoutes;
  private readonly currentTime = signal(Date.now());
  // The second chart is absent when submission is not applicable; raw API nulls remain in data().
  readonly activityPoints = computed(() =>
    (this.data()?.activity ?? []).map(point => ({
      ...point,
      submittedSolutions: point.submittedSolutions ?? 0,
    })),
  );
  readonly statusLabel = assignmentStatusLabels;
  readonly criterionValue = assignmentCriterionValue;
  readonly deadlines = computed(() =>
    programDeadlines(
      this.dates(),
      this.data()?.solutionFunnel.submissionApplicable ?? false,
      new Date(this.currentTime()),
    ),
  );
  readonly count = computed(() =>
    this.modal() === "solutions" ? (this.list()?.count ?? 0) : this.participantCount(),
  );
  readonly selectedCount = computed(() =>
    this.selection().mode === "all"
      ? Math.max(0, this.count() - this.selection().excludedIds.length)
      : this.selection().ids.length,
  );
  readonly visibleAssignments = computed(() =>
    this.assignments().filter(
      a => this.selectedExpert() === null || a.expert.expertId === this.selectedExpert(),
    ),
  );
  readonly participantFunnel = computed(() => {
    const f = this.data()?.participantFunnel;
    return f
      ? [
          {
            key: "registered",
            label: "Зарегистрировались",
            value: f.uniqueParticipants,
            tooltip: "Уникальные регистрации программы.",
            axisLabel: ["Регистрация"],
          },
          {
            key: "visited",
            label: "Заходили на платформу",
            value: f.visitedParticipants,
            tooltip: "Зафиксированный вход или активность.",
            axisLabel: ["Заходили на", "платформу"],
          },
          {
            key: "team",
            label: "Вступили в команду",
            value: f.withTeam,
            tooltip: "Капитаны и принятые участники активных заявок. Приглашения не учитываются.",
            axisLabel: ["Вступили", "в команду"],
          },
        ]
      : [];
  });
  readonly solutionFunnel = computed(() => {
    const f = this.data()?.solutionFunnel;
    return f
      ? [
          {
            key: "created",
            label: "Создано",
            value: f.created,
            tooltip: "Активные заявки программы.",
            axisLabel: ["Создано"],
          },
          ...(f.submissionApplicable
            ? [
                {
                  key: "submitted",
                  label: "Сдано",
                  value: f.submitted,
                  tooltip: "Сданные решения.",
                  axisLabel: ["Сдано"],
                },
                {
                  key: "evaluated",
                  label: "Оценено",
                  value: f.evaluated,
                  tooltip: "Завершенность определяет сервер по правилам оценивания программы.",
                  axisLabel: ["Оценено"],
                },
              ]
            : []),
        ]
      : [];
  });
  constructor() {
    timer(60_000, 60_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.currentTime.set(Date.now()));
    effect(() => {
      this.programId();
      untracked(() => {
        this.close(true);
        this.load();
      });
    });
  }
  load(): void {
    this.cancel.next();
    this.cancelExport.next();
    this.exporting.set(false);
    this.exportError.set("");
    this.pending.set(true);
    this.error.set("");
    this.data.set(null);
    this.overviewApi
      .execute(this.programId())
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.pending.set(false);
        if (result.ok && result.value.programId === this.programId()) this.data.set(result.value);
        else this.error.set("Не удалось загрузить аналитику этой программы.");
      });
  }
  download(kind: "program" | "solutions" | "submitted" | "scores", filtered = false): void {
    if (this.exporting()) return;
    this.exporting.set(true);
    this.exportError.set("");
    const query =
      filtered && kind === "solutions"
        ? { kind, ...this.query(), search: this.appliedSearch() }
        : { kind };
    this.exportApi
      .execute(this.programId(), query)
      .pipe(
        takeUntil(this.cancel),
        takeUntil(this.cancelExport),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.exporting.set(false);
        if (result.ok) saveAs(result.value, `program-${this.programId()}-${kind}.xlsx`);
        else this.exportError.set("Не удалось подготовить Excel. Повторите попытку.");
      });
  }
  openSolutions(title: string, query: SolutionManagerSolutionFilters, trigger: HTMLElement): void {
    if (!this.start("solutions", title, trigger)) return;
    this.query.set(query);
    this.loadList();
  }
  openParticipants(
    view: "participants-without-team" | "participants-without-visit",
    trigger: HTMLElement,
  ): void {
    if (
      !this.start(
        view,
        view === "participants-without-team"
          ? "Участники без команды"
          : "Участники еще не заходили на платформу",
        trigger,
      )
    )
      return;
    this.loadList();
  }
  openAssignments(
    scope: "all" | "completed" | "pending",
    trigger: HTMLElement,
    expertId: number | null = null,
  ): void {
    if (!this.start("assignments", "Назначения экспертов", trigger)) return;
    this.assignmentScope.set(scope);
    this.selectedExpert.set(expertId);
    this.loadList();
  }
  private start(view: View, title: string, trigger: HTMLElement): boolean {
    if (this.modal() || this.actionPending()) return false;
    this.close(true);
    this.trigger = trigger;
    this.modal.set(view);
    this.title.set(title);
    return true;
  }
  applySearch(): void {
    if (this.actionPending()) return;
    this.resetSelection();
    this.appliedSearch.set(this.search.value.trim());
    this.offset.set(0);
    this.loadList();
  }
  changePage(step: number): void {
    const next = this.offset() + step * 20;
    if (this.listPending() || this.actionPending() || next < 0 || next >= this.count()) return;
    this.offset.set(next);
    this.loadList();
  }
  loadList(): void {
    if (!this.modal()) return;
    this.cancelList.next();
    this.cancelDetail.next();
    this.detail.set(null);
    this.listPending.set(true);
    this.listError.set("");
    this.list.set(null);
    this.participants.set([]);
    this.assignments.set([]);
    const id = this.programId(),
      query = { search: this.appliedSearch(), limit: 20, offset: this.offset() };
    if (this.modal() === "solutions") {
      this.solutionsApi
        .execute(id, { ...this.query(), ...query })
        .pipe(takeUntil(this.cancelList), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.listPending.set(false);
          if (result.ok) this.list.set(result.value);
          else this.listError.set("Не удалось загрузить решения.");
        });
    } else if (this.modal() === "assignments") {
      this.assignmentsApi
        .execute(id, { scope: this.assignmentScope() })
        .pipe(takeUntil(this.cancelList), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.listPending.set(false);
          if (result.ok) this.assignments.set(result.value.results);
          else this.listError.set("Не удалось загрузить назначения.");
        });
    } else {
      const api =
        this.modal() === "participants-without-team" ? this.withoutTeam : this.withoutVisit;
      api
        .execute(id, query)
        .pipe(takeUntil(this.cancelList), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.listPending.set(false);
          if (result.ok) {
            this.participants.set(result.value.results);
            this.participantCount.set(result.value.count);
          } else this.listError.set("Не удалось загрузить участников.");
        });
    }
  }
  showScores(row: SolutionManagerAssignment): void {
    if (row.status !== "completed" || !this.assignments().includes(row)) return;
    this.cancelDetail.next();
    this.detail.set(null);
    this.detailPending.set(true);
    this.detailError.set("");
    this.detailApi
      .execute(this.programId(), row.assignmentId)
      .pipe(takeUntil(this.cancelDetail), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.detailPending.set(false);
        if (result.ok) this.detail.set(result.value);
        else this.detailError.set("Не удалось загрузить оценку.");
      });
  }
  backToAssignments(): void {
    this.cancelDetail.next();
    this.detail.set(null);
    this.detailPending.set(false);
    this.detailError.set("");
  }
  isSelected(id: number): boolean {
    return this.selection().mode === "all"
      ? !this.selection().excludedIds.includes(id)
      : this.selection().ids.includes(id);
  }
  toggle(id: number): void {
    if (this.actionPending()) return;
    this.preview.set(null);
    this.actionError.set("");
    const s = this.selection(),
      key = s.mode === "all" ? "excludedIds" : "ids";
    this.selection.set({
      ...s,
      [key]: s[key].includes(id) ? s[key].filter(value => value !== id) : [...s[key], id],
    });
  }
  selectAll(): void {
    if (!this.actionPending()) {
      this.preview.set(null);
      this.selection.set({ mode: "all", ids: [], excludedIds: [] });
    }
  }
  resetSelection(): void {
    this.cancelAction.next();
    this.selection.set({ mode: "selected", ids: [], excludedIds: [] });
    this.preview.set(null);
    this.actionError.set("");
  }
  canRemind(): boolean {
    return (
      this.modal() !== "assignments" &&
      (this.modal() !== "solutions" ||
        (this.query().scope === "awaiting_evaluation" &&
          this.data()?.evaluationStatus.mode === "distributed"))
    );
  }
  previewReminder(): void {
    if (!this.canRemind() || !this.selectedCount() || this.actionPending() || this.listPending())
      return;
    this.cancelAction.next();
    this.preview.set(null);
    this.actionPending.set(true);
    this.actionError.set("");
    const command = { search: this.appliedSearch(), selection: this.selection() };
    const request: Observable<Result<SolutionReminderPreview | ProgramAttentionPreview, unknown>> =
      this.modal() === "solutions"
        ? this.previewApi.execute(this.programId(), command)
        : this.participantActions.preview(
            this.programId(),
            this.modal() as "participants-without-team" | "participants-without-visit",
            command,
          );
    request
      .pipe(takeUntil(this.cancelAction), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.actionPending.set(false);
        if (result.ok) this.preview.set(result.value);
        else this.actionError.set("Не удалось подготовить напоминание. Повторите попытку.");
      });
  }
  confirmReminder(): void {
    const token = this.preview()?.token;
    if (!token || this.actionPending()) return;
    this.actionPending.set(true);
    this.actionError.set("");
    const request: Observable<Result<{ createdCount: number; skippedCount: number }, unknown>> =
      this.modal() === "solutions"
        ? this.confirmApi.execute(this.programId(), token)
        : this.participantActions.send(
            this.programId(),
            this.modal() as "participants-without-team" | "participants-without-visit",
            token,
          );
    request
      .pipe(takeUntil(this.cancelAction), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.actionPending.set(false);
        this.preview.set(null);
        if (result.ok) {
          this.resetSelection();
          this.message.set(
            `Напоминания созданы: ${result.value.createdCount}. Пропущено: ${result.value.skippedCount}.`,
          );
        } else
          this.actionError.set(
            "Напоминание не отправлено. Обновите список и подготовьте его заново.",
          );
      });
  }
  close(force = false): void {
    if (this.actionPending() && !force) return;
    this.cancelList.next();
    this.cancelAction.next();
    this.cancelDetail.next();
    this.actionPending.set(false);
    this.cancelExport.next();
    this.exporting.set(false);
    this.modal.set(null);
    this.list.set(null);
    this.participants.set([]);
    this.participantCount.set(0);
    this.assignments.set([]);
    this.detail.set(null);
    this.detailPending.set(false);
    this.detailError.set("");
    this.search.setValue("");
    this.appliedSearch.set("");
    this.offset.set(0);
    this.query.set({});
    this.message.set("");
    this.resetSelection();
    if (!force && this.trigger?.isConnected) this.trigger.focus();
    this.trigger = null;
  }
}
