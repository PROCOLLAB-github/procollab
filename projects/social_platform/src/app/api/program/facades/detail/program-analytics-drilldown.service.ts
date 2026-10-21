/** @format */
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, takeUntil } from "rxjs";
import { saveAs } from "file-saver";
import { ProgramAttentionActionsUseCase } from "@api/program/use-cases/program-attention-actions.use-case";
import {
  ProgramAttentionCategory,
  ProgramAttentionSelection,
  ProgramAttentionPreview,
} from "@domain/program/program-attention-actions.model";
import { ProgramCaseProjectsService } from "./program-case-projects.service";
import { ProgramCaseSelection } from "@domain/program/program-case-analytics.model";
import { ProgramAnalyticsCaseMetrics } from "@domain/program/program-analytics.model";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerParticipantsWithoutVisitUseCase } from "@api/program/use-cases/get-program-manager-participants-without-visit.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import { GetProgramManagerProjectsNotSubmittedUseCase } from "@api/program/use-cases/get-program-manager-projects-not-submitted.use-case";
import {
  ProgramAnalyticsAttentionPage,
  ProgramAnalyticsAttentionParticipant,
  ProgramAnalyticsAttentionProjects,
  ProgramAnalyticsNotSubmittedProjectsPage,
} from "@domain/program/program-analytics-attention.model";
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentScope,
  ProgramAnalyticsAssignmentScoreDetail,
  ProgramAnalyticsDelayedExpert,
  ProgramAnalyticsDelayedExperts,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";

/** Root-списки внимания используют тот же modal context, не вложенную модалку. */
export type AnalyticsAttentionView =
  | "participants-without-visit"
  | "participants-without-team"
  | "projects-awaiting-evaluation"
  | "projects-not-submitted";
export type AnalyticsDrilldownView =
  | "case"
  | "assignments"
  | "scores"
  | "delayed"
  | "backlog"
  | AnalyticsAttentionView;

/** Живёт вместе с одной analytics-модалкой, не сохраняет manager-данные между открытиями. */
@Injectable()
export class ProgramAnalyticsDrilldownService {
  private readonly actions = inject(ProgramAttentionActionsUseCase);
  private readonly cancelActions = new Subject<void>();
  readonly selection = signal<ProgramAttentionSelection>({
    mode: "selected",
    ids: [],
    excludedIds: [],
  });
  private readonly allSelectionCount = signal(0);
  readonly preview = signal<ProgramAttentionPreview | null>(null);
  readonly actionPending = signal<"preview" | "send" | "export" | null>(null);
  readonly actionError = signal("");
  readonly actionSuccess = signal("");
  readonly supportsActions = computed(
    () => this.isAttentionView() && this.view() !== "projects-not-submitted",
  );
  readonly selectedCount = computed(() => {
    const selection = this.selection();
    return selection.mode === "all"
      ? Math.max(0, this.allSelectionCount() - selection.excludedIds.length)
      : selection.ids.length;
  });

  readonly allFoundSelected = computed(
    () => this.selectedCount() > 0 && this.selectedCount() === this.attentionCount(),
  );
  readonly someFoundSelected = computed(() => this.selectedCount() > 0 && !this.allFoundSelected());

  toggleAllFound(): void {
    if (this.allFoundSelected()) this.clearSelection();
    else this.selectAllFound();
  }

  isSelected(id: number): boolean {
    const selection = this.selection();
    return selection.mode === "all"
      ? !selection.excludedIds.includes(id)
      : selection.ids.includes(id);
  }

  toggleSelection(id: number): void {
    if (this.actionPending()) return;
    this.preview.set(null);
    this.actionError.set("");
    this.actionSuccess.set("");
    const current = this.selection();
    const field = current.mode === "all" ? "excludedIds" : "ids";
    const ids = current[field];
    this.selection.set({
      ...current,
      [field]: ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id],
    });
  }

  selectAllFound(): void {
    if (this.actionPending() || this.attentionPending() || !this.attentionCount()) return;
    this.allSelectionCount.set(this.attentionCount());
    this.selection.set({ mode: "all", ids: [], excludedIds: [] });
    this.preview.set(null);
    this.actionError.set("");
    this.actionSuccess.set("");
  }

  clearSelection(): void {
    if (this.actionPending()) return;
    this.resetActions();
  }

  backToAttentionList(): void {
    if (this.actionPending()) return;
    this.preview.set(null);
    this.actionError.set("");
  }

  previewReminder(): void {
    const category = this.actionCategory();
    if (
      this.programId === null ||
      !category ||
      !this.selectedCount() ||
      this.actionPending() ||
      this.attentionPending() ||
      this.attentionError()
    )
      return;
    this.actionPending.set("preview");
    this.actionError.set("");
    this.actionSuccess.set("");
    this.actions
      .preview(this.programId, category, {
        search: this.appliedSearch(),
        selection: this.selection(),
      })
      .pipe(takeUntil(this.cancelActions), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.actionPending.set(null);
        if (result.ok) this.preview.set(result.value);
        else this.setActionError(result.error.kind);
      });
  }

  sendReminder(): void {
    const category = this.actionCategory();
    const token = this.preview()?.token;
    if (this.programId === null || !category || !token || this.actionPending()) return;
    this.actionPending.set("send");
    this.actionError.set("");
    this.actions
      .send(this.programId, category, token)
      .pipe(takeUntil(this.cancelActions), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.actionPending.set(null);
        if (result.ok) {
          this.resetActions();
          const message = result.value.createdCount
            ? `Напоминания созданы: ${result.value.createdCount}. Письма поставлены в очередь.`
            : "Нет доступных получателей для напоминания.";
          this.actionSuccess.set(
            `${message}${result.value.skippedCount ? ` Пропущено после повторной проверки: ${result.value.skippedCount}.` : ""}`,
          );
        } else this.setActionError(result.error.kind);
      });
  }

  exportAttention(): void {
    const category = this.actionCategory();
    if (
      this.programId === null ||
      !category ||
      this.actionPending() ||
      this.attentionPending() ||
      this.attentionError() ||
      !this.attentionCount()
    )
      return;
    this.actionPending.set("export");
    this.actionError.set("");
    this.actions
      .export(this.programId, category, {
        search: this.appliedSearch(),
        selection: this.selectedCount()
          ? this.selection()
          : { mode: "all", ids: [], excludedIds: [] },
      })
      .pipe(takeUntil(this.cancelActions), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.actionPending.set(null);
        if (result.ok) saveAs(result.value, `Требует внимания-${category}-${this.programId}.xlsx`);
        else this.setActionError(result.error.kind);
      });
  }

  private actionCategory(): ProgramAttentionCategory | null {
    return this.open() && this.supportsActions() ? (this.view() as ProgramAttentionCategory) : null;
  }

  private setActionError(kind: string): void {
    this.actionError.set(
      kind === "forbidden" || kind === "unauthorized"
        ? "Нет доступа к действию. Обновите страницу и проверьте права."
        : kind === "validation"
          ? "Выбор или предпросмотр устарел либо превышает 10 000 строк. Уточните поиск и проверьте получателей еще раз."
          : "Не удалось выполнить действие. Попробуйте еще раз.",
    );
    if (kind === "validation") this.preview.set(null);
  }

  private resetActions(): void {
    this.cancelActions.next();
    this.selection.set({ mode: "selected", ids: [], excludedIds: [] });
    this.allSelectionCount.set(0);
    this.preview.set(null);
    this.actionPending.set(null);
    this.actionError.set("");
    this.actionSuccess.set("");
  }
  readonly cases = inject(ProgramCaseProjectsService);

  openCase(
    programId: number,
    selection: ProgramCaseSelection,
    metrics: ProgramAnalyticsCaseMetrics,
    applicable: boolean,
    programName = "program",
  ): void {
    if (!this.start(programId)) return;
    this.view.set("case");
    this.cases.open(programId, selection, metrics, applicable, programName);
  }

  private readonly getAssignments = inject(GetProgramManagerAssignmentsUseCase);
  private readonly getScores = inject(GetProgramManagerAssignmentScoresUseCase);
  private readonly getParticipants = inject(GetProgramManagerParticipantsWithoutTeamUseCase);
  private readonly getWithoutVisit = inject(GetProgramManagerParticipantsWithoutVisitUseCase);
  private readonly getProjects = inject(GetProgramManagerProjectsAwaitingEvaluationUseCase);
  private readonly getNotSubmitted = inject(GetProgramManagerProjectsNotSubmittedUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelAssignments = new Subject<void>();
  private readonly cancelScores = new Subject<void>();
  private readonly cancelAttention = new Subject<void>();
  private programId: number | null = null;
  private selectedAssignmentId: number | null = null;

  readonly open = signal(false);
  readonly view = signal<AnalyticsDrilldownView>("assignments");
  readonly scope = signal<ProgramAnalyticsAssignmentScope>("all");
  readonly assignments = signal<ProgramAnalyticsAssignment[]>([]);
  readonly assignmentsPending = signal(false);
  readonly assignmentsError = signal<ProgramAnalyticsError | null>(null);
  readonly scoreDetail = signal<ProgramAnalyticsAssignmentScoreDetail | null>(null);
  readonly scoreDetailPending = signal(false);
  readonly scoreDetailError = signal<ProgramAnalyticsError | null>(null);
  readonly delayedExperts = signal<ProgramAnalyticsDelayedExpert[]>([]);
  readonly selectedExpert = signal<ProgramAnalyticsDelayedExpert | null>(null);

  readonly searchDraft = signal("");
  readonly appliedSearch = signal("");
  readonly attentionLimit = 25;
  readonly attentionOffset = signal(0);
  readonly participantsPage =
    signal<ProgramAnalyticsAttentionPage<ProgramAnalyticsAttentionParticipant> | null>(null);
  readonly projectsPage = signal<ProgramAnalyticsAttentionProjects | null>(null);
  readonly notSubmittedPage = signal<ProgramAnalyticsNotSubmittedProjectsPage | null>(null);
  readonly attentionPending = signal(false);
  readonly attentionError = signal<ProgramAnalyticsError | null>(null);
  readonly isParticipantView = computed(
    () =>
      this.view() === "participants-without-team" || this.view() === "participants-without-visit",
  );
  readonly isAttentionView = computed(
    () =>
      this.isParticipantView() ||
      this.view() === "projects-awaiting-evaluation" ||
      this.view() === "projects-not-submitted",
  );
  readonly attentionPage = computed(() =>
    this.isParticipantView()
      ? this.participantsPage()
      : this.view() === "projects-not-submitted"
        ? this.notSubmittedPage()
        : this.projectsPage(),
  );
  readonly attentionCount = computed(() => this.attentionPage()?.count ?? 0);
  readonly attentionHasNext = computed(() => {
    const page = this.attentionPage();
    return !!page && this.attentionOffset() + page.results.length < page.count;
  });
  readonly attentionRange = computed(() => {
    const page = this.attentionPage();
    if (!page?.results.length) return `0 из ${page?.count ?? 0}`;
    return `${this.attentionOffset() + 1}–${this.attentionOffset() + page.results.length} из ${page.count}`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.close());
  }

  /** Каждое root-open очищает поиск/страницу/старые данные и делает ровно один запрос. */
  openAttention(
    programId: number,
    view: AnalyticsAttentionView,
    notSubmittedApplicable = false,
  ): void {
    // Только явно подтверждённая overview применимость разрешает новый сценарий.
    if (view === "projects-not-submitted" && !notSubmittedApplicable) return;
    if (!this.start(programId)) return;
    this.view.set(view);
    this.loadAttention();
  }

  /** Query остаётся черновиком до Enter; сервер получает trimmed search с первой страницы. */
  applyAttentionSearch(): void {
    if (!this.open() || !this.isAttentionView()) return;
    if (this.actionPending()) return;
    this.resetActions();
    this.appliedSearch.set(this.searchDraft().trim());
    this.attentionOffset.set(0);
    this.loadAttention();
  }

  /** Явная очистка возвращает первую страницу полного списка. */
  clearAttentionSearch(): void {
    this.searchDraft.set("");
    this.applyAttentionSearch();
  }

  /** Переход отменяет запрос; ссылка next от backend не используется как произвольный URL. */
  changeAttentionPage(direction: -1 | 1): void {
    if (!this.open() || !this.isAttentionView()) return;
    if (direction === 1 && (this.attentionPending() || !this.attentionHasNext())) return;
    if (direction === -1 && this.attentionOffset() === 0) return;
    this.attentionOffset.update(offset => Math.max(0, offset + direction * this.attentionLimit));
    this.loadAttention();
  }

  /** Retry сохраняет search/offset; takeUntil не допускает позднего ответа прошлого контекста. */
  loadAttention(): void {
    if (!this.open() || this.programId === null || !this.isAttentionView()) return;
    this.cancelAttention.next();
    this.participantsPage.set(null);
    this.projectsPage.set(null);
    this.notSubmittedPage.set(null);
    this.attentionError.set(null);
    this.attentionPending.set(true);
    const query = {
      search: this.appliedSearch(),
      limit: this.attentionLimit,
      offset: this.attentionOffset(),
    };
    if (this.isParticipantView()) {
      const useCase =
        this.view() === "participants-without-visit" ? this.getWithoutVisit : this.getParticipants;
      useCase
        .execute(this.programId, query)
        .pipe(takeUntil(this.cancelAttention), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.attentionPending.set(false);
          if (result.ok) this.participantsPage.set(result.value);
          else this.attentionError.set(result.error);
        });
    } else if (this.view() === "projects-not-submitted") {
      this.getNotSubmitted
        .execute(this.programId, query)
        .pipe(takeUntil(this.cancelAttention), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.attentionPending.set(false);
          if (result.ok) this.notSubmittedPage.set(result.value);
          else this.attentionError.set(result.error);
        });
    } else {
      this.getProjects
        .execute(this.programId, query)
        .pipe(takeUntil(this.cancelAttention), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.attentionPending.set(false);
          if (result.ok) this.projectsPage.set(result.value);
          else this.attentionError.set(result.error);
        });
    }
  }

  /** Фильтруем по expertId, не userId/имени; порядок backend внутри группы сохраняется. */
  readonly backlog = computed(() =>
    this.assignments().filter(item => item.expert.expertId === this.selectedExpert()?.expertId),
  );
  readonly waitingBacklog = computed(() =>
    this.backlog().filter(item => item.status !== "not_ready"),
  );
  readonly notReadyBacklog = computed(() =>
    this.backlog().filter(item => item.status === "not_ready"),
  );

  /** Единственная точка открытия: вызывается после проверки контекста программы UI. */
  openAssignments(programId: number, scope: ProgramAnalyticsAssignmentScope): void {
    if (!this.start(programId)) return;
    this.scope.set(scope);
    this.loadAssignments();
  }

  /** Список задержек уже есть в overview; pending запрашиваем только для backlog. */
  openDelayed(programId: number, delayed: ProgramAnalyticsDelayedExperts): void {
    if (!this.start(programId)) return;
    this.view.set("delayed");
    this.scope.set("pending");
    this.delayedExperts.set(delayed.items);
    this.loadAssignments();
  }

  /** Повторная загрузка отменяет предыдущую и не скрывает delayed experts. */
  loadAssignments(): void {
    if (!this.open() || this.programId === null) return;
    this.cancelAssignments.next();
    this.assignments.set([]);
    this.assignmentsError.set(null);
    this.assignmentsPending.set(true);
    this.getAssignments
      .execute(this.programId, this.scope())
      .pipe(takeUntil(this.cancelAssignments), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.assignmentsPending.set(false);
        if (result.ok) this.assignments.set(result.value);
        else this.assignmentsError.set(result.error);
      });
  }

  /** Детализация только назначения из загруженного списка текущей программы. */
  loadAssignmentScores(assignmentId: number): void {
    if (
      !this.open() ||
      this.programId === null ||
      !this.assignments().some(
        item => item.assignmentId === assignmentId && item.status === "completed",
      )
    )
      return;
    this.cancelScores.next();
    this.selectedAssignmentId = assignmentId;
    this.view.set("scores");
    this.scoreDetail.set(null);
    this.scoreDetailError.set(null);
    this.scoreDetailPending.set(true);
    this.getScores
      .execute(this.programId, assignmentId)
      .pipe(takeUntil(this.cancelScores), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.scoreDetailPending.set(false);
        if (result.ok) this.scoreDetail.set(result.value);
        else this.scoreDetailError.set(result.error);
      });
  }

  retryScores(): void {
    if (this.selectedAssignmentId !== null) this.loadAssignmentScores(this.selectedAssignmentId);
  }

  showBacklog(expert: ProgramAnalyticsDelayedExpert): void {
    if (!this.open() || !this.delayedExperts().includes(expert)) return;
    this.selectedExpert.set(expert);
    this.view.set("backlog");
  }

  /** Back не перезапрашивает список и отменяет незавершённую загрузку detail. */
  back(): void {
    this.cancelScores.next();
    this.scoreDetail.set(null);
    this.scoreDetailError.set(null);
    this.scoreDetailPending.set(false);
    this.selectedAssignmentId = null;
    this.selectedExpert.set(null);
    this.view.set(this.view() === "backlog" ? "delayed" : "assignments");
  }

  /** Закрытие и смена программы уничтожают весь локальный контекст и активные запросы. */
  close(): void {
    this.resetActions();
    this.cases.reset();
    this.cancelAssignments.next();
    this.cancelScores.next();
    this.cancelAttention.next();
    this.searchDraft.set("");
    this.appliedSearch.set("");
    this.attentionOffset.set(0);
    this.participantsPage.set(null);
    this.projectsPage.set(null);
    this.notSubmittedPage.set(null);
    this.attentionPending.set(false);
    this.attentionError.set(null);
    this.open.set(false);
    this.programId = null;
    this.selectedAssignmentId = null;
    this.view.set("assignments");
    this.scope.set("all");
    this.assignments.set([]);
    this.assignmentsPending.set(false);
    this.assignmentsError.set(null);
    this.scoreDetail.set(null);
    this.scoreDetailPending.set(false);
    this.scoreDetailError.set(null);
    this.delayedExperts.set([]);
    this.selectedExpert.set(null);
  }

  private start(programId: number): boolean {
    this.close();
    if (!Number.isInteger(programId) || programId <= 0) return false;
    this.programId = programId;
    this.open.set(true);
    return true;
  }
}
