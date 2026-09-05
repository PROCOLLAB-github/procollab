/** @format */
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, takeUntil } from "rxjs";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import {
  ProgramAnalyticsAttentionPage,
  ProgramAnalyticsAttentionParticipant,
  ProgramAnalyticsAttentionProjects,
} from "@domain/program/program-analytics-attention.model";
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentScope,
  ProgramAnalyticsAssignmentScoreDetail,
  ProgramAnalyticsDelayedExpert,
  ProgramAnalyticsDelayedExperts,
  ProgramAnalyticsError,
} from "@domain/program/program-analytics.model";

/** Два root-списка внимания используют тот же modal context, не вложенную модалку. */
export type AnalyticsAttentionView = "participants-without-team" | "projects-awaiting-evaluation";
export type AnalyticsDrilldownView =
  | "assignments"
  | "scores"
  | "delayed"
  | "backlog"
  | AnalyticsAttentionView;

/** Живёт вместе с одной analytics-модалкой, не сохраняет manager-данные между открытиями. */
@Injectable()
export class ProgramAnalyticsDrilldownService {
  private readonly getAssignments = inject(GetProgramManagerAssignmentsUseCase);
  private readonly getScores = inject(GetProgramManagerAssignmentScoresUseCase);
  private readonly getParticipants = inject(GetProgramManagerParticipantsWithoutTeamUseCase);
  private readonly getProjects = inject(GetProgramManagerProjectsAwaitingEvaluationUseCase);
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
  readonly attentionPending = signal(false);
  readonly attentionError = signal<ProgramAnalyticsError | null>(null);
  readonly isAttentionView = computed(
    () =>
      this.view() === "participants-without-team" || this.view() === "projects-awaiting-evaluation",
  );
  readonly attentionPage = computed(() =>
    this.view() === "participants-without-team" ? this.participantsPage() : this.projectsPage(),
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
  openAttention(programId: number, view: AnalyticsAttentionView): void {
    if (!this.start(programId)) return;
    this.view.set(view);
    this.loadAttention();
  }

  /** Query остаётся черновиком до Enter; сервер получает trimmed search с первой страницы. */
  applyAttentionSearch(): void {
    if (!this.open() || !this.isAttentionView()) return;
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
    this.attentionError.set(null);
    this.attentionPending.set(true);
    const query = {
      search: this.appliedSearch(),
      limit: this.attentionLimit,
      offset: this.attentionOffset(),
    };
    if (this.view() === "participants-without-team") {
      this.getParticipants
        .execute(this.programId, query)
        .pipe(takeUntil(this.cancelAttention), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          this.attentionPending.set(false);
          if (result.ok) this.participantsPage.set(result.value);
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
    this.cancelAssignments.next();
    this.cancelScores.next();
    this.cancelAttention.next();
    this.searchDraft.set("");
    this.appliedSearch.set("");
    this.attentionOffset.set(0);
    this.participantsPage.set(null);
    this.projectsPage.set(null);
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
