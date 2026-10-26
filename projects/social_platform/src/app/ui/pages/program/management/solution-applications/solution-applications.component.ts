/** @format */
import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, map, Observable, Subject, takeUntil } from "rxjs";
import { Result } from "@domain/shared/result.type";
import { saveAs } from "file-saver";
import { AppRoutes } from "@api/paths/app-routes";
import { presentationHref } from "@utils/program-case-analytics";
import {
  GetSolutionUseCase,
  ListSolutionsUseCase,
} from "@api/solution/use-cases/solution.use-cases";
import { GetManagedSolutionFormUseCase } from "@api/solution/use-cases/solution-form.use-cases";
import {
  ExportSolutionAnalyticsUseCase,
  GetSolutionManagerSolutionsUseCase,
} from "@api/solution/use-cases/solution-manager-analytics.use-cases";
import {
  PreviewSolutionSubmitActionUseCase,
  ApplySolutionSubmitActionUseCase,
} from "@api/solution/use-cases/solution-submission-actions.use-cases";
import {
  PreviewSolutionArchiveUseCase,
  ApplySolutionArchiveUseCase,
} from "@api/solution/use-cases/solution-archive.use-cases";
import {
  PreviewSolutionMemberRemovalUseCase,
  ApplySolutionMemberRemovalUseCase,
} from "@api/solution/use-cases/solution-member-actions.use-cases";
import { ListSolutionAdminChangesUseCase } from "@api/solution/use-cases/solution-history.use-cases";
import { SolutionManagerSolutionFilters } from "@domain/solution/ports/solution.repository.port";
import {
  ProgramSolution,
  SolutionApiError,
  SolutionAdminChangePage,
  SolutionField,
  SolutionManagerSolutionRow,
  SolutionMember,
} from "@domain/solution/solution-contract.model";
import { ProgramManagement } from "@domain/program/program-management.model";
import {
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  IconComponent,
  PaginationComponent,
  TableDirective,
} from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import {
  RowAction,
  RowActionEvent,
  RowActionsComponent,
} from "@ui/primitives/row-actions/row-actions.component";
import { SolutionFieldsComponent } from "@ui/widgets/solution-fields/solution-fields.component";
import { SolutionCaseActionComponent, SolutionCaseRequest } from "./solution-case-action.component";
import { SolutionAllocationComponent } from "./solution-allocation.component";

type ActionRequest =
  | { kind: "submit"; ids: number[] }
  | { kind: "archive"; ids: number[] }
  | { kind: "member"; ids: number[]; member: SolutionMember };
type ActionPreview = {
  token: string | null;
  canApply: boolean;
  issues: string[];
  scores: number;
  removedAssignments: number;
  invitations: number;
};

@Component({
  selector: "app-solution-applications",
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    IconComponent,
    PaginationComponent,
    TableDirective,
    ModalComponent,
    RowActionsComponent,
    SolutionFieldsComponent,
    SolutionCaseActionComponent,
    SolutionAllocationComponent,
  ],
  templateUrl: "./solution-applications.component.html",
  styleUrls: ["../management.component.scss", "./solution-applications.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionApplicationsComponent {
  readonly program = input.required<ProgramManagement>();
  readonly busyChange = output<boolean>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly getList = inject(GetSolutionManagerSolutionsUseCase);
  private readonly getArchive = inject(ListSolutionsUseCase);
  private readonly get = inject(GetSolutionUseCase);
  private readonly form = inject(GetManagedSolutionFormUseCase);
  private readonly exportApi = inject(ExportSolutionAnalyticsUseCase);
  private readonly historyApi = inject(ListSolutionAdminChangesUseCase);
  private readonly submitPreview = inject(PreviewSolutionSubmitActionUseCase);
  private readonly submitApply = inject(ApplySolutionSubmitActionUseCase);
  private readonly archivePreview = inject(PreviewSolutionArchiveUseCase);
  private readonly archiveApply = inject(ApplySolutionArchiveUseCase);
  private readonly memberPreview = inject(PreviewSolutionMemberRemovalUseCase);
  private readonly memberApply = inject(ApplySolutionMemberRemovalUseCase);
  private readonly cancelList = new Subject<void>();
  private readonly cancelDetail = new Subject<void>();
  private readonly cancelAction = new Subject<void>();
  private readonly cancelForm = new Subject<void>();
  private readonly cancelMaterial = new Subject<void>();
  private trigger: HTMLElement | null = null;
  private activeProgram = 0;
  private selectionKey = "";
  readonly paths = AppRoutes;
  readonly rows = signal<SolutionManagerSolutionRow[]>([]);
  readonly presentationLinks = signal(new Map<number, string>());
  readonly materialLoading = signal<number | null>(null);
  readonly fields = signal<SolutionField[]>([]);
  readonly formError = signal<string | null>(null);
  readonly count = signal(0);
  readonly offset = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly selected = signal(new Set<number>());
  readonly selecting = signal(false);
  readonly filtersOpen = signal(false);
  readonly archived = signal(false);
  readonly search = new FormControl("", { nonNullable: true });
  readonly caseFilter = new FormControl("all", { nonNullable: true });
  readonly submissionFilter = new FormControl("all", { nonNullable: true });
  readonly fieldFilter = new FormControl("", { nonNullable: true });
  readonly answerFilter = new FormControl("all", { nonNullable: true });
  readonly participation = new FormControl("active", { nonNullable: true });
  readonly exporting = signal(false);
  readonly detailOpen = signal(false);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly detail = signal<ProgramSolution | null>(null);
  readonly materials = signal(new FormGroup({}));
  readonly teamTab = signal(false);
  readonly history = signal<SolutionAdminChangePage | null>(null);
  readonly historyOpen = signal(false);
  readonly historyLoading = signal(false);
  readonly caseRequest = signal<SolutionCaseRequest | null>(null);
  readonly allocationRequest = signal<{ programId: number; ids: number[] } | null>(null);
  readonly actionRequest = signal<ActionRequest | null>(null);
  readonly actionPreview = signal<ActionPreview | null>(null);
  readonly actionLoading = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly applying = signal(false);
  readonly limit = 20;
  readonly Array = Array;
  readonly caseOptions = computed(
    () => this.fields().find(f => f.purpose === "case")?.options ?? [],
  );
  readonly allPicked = computed(
    () =>
      !!this.rows().length && this.rows().every(r => this.selected().has(r.application.solutionId)),
  );
  readonly actionTitle = computed(
    () =>
      ({
        submit: "Сдать решение за команду",
        archive: "Открепить от программы",
        member: "Исключить участника",
      })[this.actionRequest()?.kind ?? "submit"],
  );

  constructor() {
    effect(() => {
      const program = this.program();
      untracked(() => {
        if (program.id === this.activeProgram) return;
        this.cancelForm.next();
        this.cancelDetail.next();
        this.cancelAction.next();
        this.detailOpen.set(false);
        this.detail.set(null);
        this.caseRequest.set(null);
        this.allocationRequest.set(null);
        this.actionRequest.set(null);
        this.actionPreview.set(null);
        this.filtersOpen.set(false);
        this.message.set(null);
        this.formError.set(null);
        this.activeProgram = program.id;
        this.fields.set([]);
        this.form
          .execute(program.id)
          .pipe(takeUntil(this.cancelForm), takeUntilDestroyed(this.destroyRef))
          .subscribe(result => {
            if (program.id !== this.activeProgram) return;
            if (result.ok) this.fields.set(result.value.form.fields);
            else this.formError.set(result.error.detail);
          });
        this.load();
      });
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.activeProgram) this.load();
    });
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(search => this.navigate({ search: search.trim() || null, offset: null }));
  }
  filters(): SolutionManagerSolutionFilters {
    const q = this.route.snapshot.queryParamMap;
    const submission = q.get("submission"),
      caseScope = q.get("case_scope"),
      answerState = q.get("answer_state"),
      fieldId = Number(q.get("field_id"));
    return {
      search: q.get("search")?.trim() || undefined,
      submission: submission === "submitted" || submission === "not_submitted" ? submission : "all",
      caseScope: caseScope === "selected" || caseScope === "without_case" ? caseScope : "all",
      ...(caseScope === "selected" ? { caseName: q.get("case_name") ?? "" } : {}),
      ...(Number.isSafeInteger(fieldId) && fieldId > 0
        ? {
            fieldId,
            answerState:
              answerState === "present" ||
              answerState === "missing" ||
              answerState === "not_applicable"
                ? answerState
                : "all",
          }
        : {}),
    };
  }
  load(): void {
    const programId = this.activeProgram;
    if (!programId) return;
    this.cancelList.next();
    this.cancelMaterial.next();
    this.presentationLinks.set(new Map());
    this.materialLoading.set(null);
    this.selecting.set(false);
    const q = this.route.snapshot.queryParamMap,
      offset = Number(q.get("offset"));
    this.offset.set(Number.isSafeInteger(offset) && offset >= 0 ? offset : 0);
    this.archived.set(q.get("participation") === "archived");
    const filters = this.filters();
    const key = JSON.stringify([programId, filters, this.archived()]);
    if (this.selectionKey !== key) this.selected.set(new Set());
    this.selectionKey = key;
    this.search.setValue(filters.search ?? "", { emitEvent: false });
    this.rows.set([]);
    this.count.set(0);
    this.error.set(null);
    this.loading.set(true);
    const request: Observable<
      Result<{ count: number; results: SolutionManagerSolutionRow[] }, SolutionApiError>
    > = this.archived()
      ? this.getArchive
          .execute(programId, {
            participation: "archived",
            search: filters.search,
            offset: this.offset(),
            limit: this.limit,
          })
          .pipe(
            map(result =>
              result.ok
                ? {
                    ok: true as const,
                    value: {
                      count: result.value.count,
                      results: result.value.results.map(item => ({
                        application: {
                          kind: "solution" as const,
                          programId,
                          solutionId: item.id,
                          name: item.name,
                        },
                        captain: {
                          userId: item.captain.id,
                          fullName: `${item.captain.firstName} ${item.captain.lastName}`,
                          avatar: item.captain.avatarUrl,
                        },
                        caseName: item.caseValue,
                        submissionStatus: item.status,
                        evaluationStatus: "not_applicable" as const,
                        createdAt: "",
                        submittedAt: item.submittedAt,
                        assignmentsTotal: null,
                        assignmentsCompleted: null,
                        waitingReason: null,
                      })),
                    },
                  }
                : result,
            ),
          )
      : this.getList.execute(programId, { ...filters, offset: this.offset(), limit: this.limit });
    request
      .pipe(takeUntil(this.cancelList), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.loading.set(false);
        if (result.ok) {
          this.rows.set(result.value.results);
          this.count.set(result.value.count);
        } else this.error.set(result.error.detail);
      });
  }
  navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
    });
  }
  page(direction: number): void {
    this.navigate({ offset: Math.max(0, this.offset() + direction * this.limit) || null });
  }
  toggle(id: number): void {
    this.selected.update(ids => {
      const next = new Set(ids);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  clear(): void {
    this.selected.set(new Set());
  }
  selectAll(): void {
    if (this.selecting() || this.archived()) return;
    if (this.allPicked()) {
      this.clear();
      return;
    }
    this.selecting.set(true);
    const filters = this.filters(),
      programId = this.activeProgram,
      ids = new Set<number>();
    const read = (offset: number) =>
      this.getList
        .execute(programId, { ...filters, offset, limit: 100 })
        .pipe(takeUntil(this.cancelList), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          if (!result.ok) {
            this.error.set(result.error.detail);
            this.selecting.set(false);
            return;
          }
          result.value.results.forEach(row => ids.add(row.application.solutionId));
          const next = offset + result.value.results.length;
          if (result.value.next && next < result.value.count && next > offset) read(next);
          else {
            this.selected.set(ids);
            this.selecting.set(false);
          }
        });
    read(0);
  }
  openFilters(trigger: HTMLElement): void {
    this.trigger = trigger;
    const filters = this.filters();
    this.participation.setValue(this.archived() ? "archived" : "active");
    this.caseFilter.setValue(
      filters.caseScope === "selected" ? `case:${filters.caseName}` : (filters.caseScope ?? "all"),
    );
    this.submissionFilter.setValue(filters.submission ?? "all");
    this.fieldFilter.setValue(filters.fieldId ? String(filters.fieldId) : "");
    this.answerFilter.setValue(filters.answerState ?? "all");
    this.filtersOpen.set(true);
  }
  applyFilters(): void {
    const caseValue = this.caseFilter.value,
      archived = this.participation.value === "archived";
    this.navigate({
      participation: archived ? "archived" : null,
      submission:
        !archived && this.submissionFilter.value !== "all" ? this.submissionFilter.value : null,
      case_scope:
        !archived && caseValue !== "all"
          ? caseValue.startsWith("case:")
            ? "selected"
            : "without_case"
          : null,
      case_name: !archived && caseValue.startsWith("case:") ? caseValue.slice(5) : null,
      field_id: !archived ? this.fieldFilter.value || null : null,
      answer_state: !archived && this.fieldFilter.value ? this.answerFilter.value : null,
      offset: null,
    });
    this.filtersOpen.set(false);
    this.restoreFocus();
  }
  export(): void {
    if (this.exporting() || this.archived()) return;
    const programId = this.activeProgram;
    this.exporting.set(true);
    this.exportApi
      .execute(programId, { kind: "solutions", ...this.filters() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.exporting.set(false);
        if (result.ok) saveAs(result.value, `program-${programId}-solutions.xlsx`);
        else this.error.set(result.error.detail);
      });
  }
  evaluation(row: SolutionManagerSolutionRow): string {
    return (
      {
        not_applicable: "Не применяется",
        not_submitted: "—",
        awaiting_evaluation: "Не оценено",
        partially_evaluated: "Частично",
        evaluated: "Оценено",
      }[row.evaluationStatus] +
      (row.assignmentsTotal ? ` · ${row.assignmentsCompleted ?? 0}/${row.assignmentsTotal}` : "")
    );
  }
  actions(row: SolutionManagerSolutionRow): RowAction[] {
    if (this.archived())
      return [
        { id: "team", label: "Посмотреть команду" },
        { id: "history", label: "История изменений" },
      ];
    return [
      { id: "team", label: "Посмотреть команду" },
      {
        id: "evaluation",
        label: "Перейти к оценке",
        routerLink: `${AppRoutes.program.solution(this.activeProgram, row.application.solutionId)}/evaluation`,
        queryParams: { returnUrl: this.router.url },
        disabled: !this.program().isCompetitive || row.submissionStatus !== "submitted",
        reason: !this.program().isCompetitive
          ? "В программе нет оценивания"
          : row.submissionStatus !== "submitted"
            ? "Решение еще не сдано"
            : undefined,
      },
      ...(this.presentationLinks().has(row.application.solutionId)
        ? [
            {
              id: "presentation",
              label: "Открыть презентацию",
              href: this.presentationLinks().get(row.application.solutionId)!,
            },
          ]
        : this.materialLoading() === row.application.solutionId &&
            this.fields().some(f => f.purpose === "presentation")
          ? [
              {
                id: "presentation",
                label: "Открыть презентацию",
                disabled: true,
                reason: "Загружаем материал…",
              },
            ]
          : []),
      {
        id: "case",
        label: "Сменить кейс",
        disabled: !this.caseOptions().length,
        reason: !this.caseOptions().length ? "В программе нет кейсов" : undefined,
      },
      {
        id: "submit",
        label: "Сдать решение",
        disabled: !this.program().isCompetitive || row.submissionStatus === "submitted",
        reason: !this.program().isCompetitive
          ? "В программе нет сдачи"
          : row.submissionStatus === "submitted"
            ? "Решение уже сдано"
            : undefined,
      },
      { id: "archive", label: "Открепить от программы", destructive: true },
    ];
  }
  action(row: SolutionManagerSolutionRow, event: RowActionEvent): void {
    this.trigger = event.trigger;
    if (event.id === "team" || event.id === "materials" || event.id === "history")
      this.open(row, event.id === "team", event.id === "history");
    else if (event.id === "case")
      this.caseRequest.set({
        programId: this.activeProgram,
        solutionId: row.application.solutionId,
        name: row.application.name,
      });
    else if (event.id === "submit" || event.id === "archive")
      this.beginAction({ kind: event.id, ids: [row.application.solutionId] });
  }
  loadMaterial(row: SolutionManagerSolutionRow): void {
    if (this.archived()) return;
    this.cancelMaterial.next();
    const programId = this.activeProgram,
      solutionId = row.application.solutionId;
    this.materialLoading.set(solutionId);
    this.presentationLinks.update(links => {
      const next = new Map(links);
      next.delete(solutionId);
      return next;
    });
    this.get
      .execute(programId, solutionId)
      .pipe(takeUntil(this.cancelMaterial), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.materialLoading.set(null);
        if (!result.ok || programId !== this.activeProgram) return;
        const field = result.value.form.fields.find(
          f => f.purpose === "presentation" && (f.type === "file" || f.type === "url"),
        );
        const value = result.value.answers.find(a => a.fieldId === field?.id)?.value;
        const href = presentationHref(
          typeof value === "string"
            ? value
            : value && typeof value === "object" && "url" in value
              ? value.url
              : null,
        );
        if (href) this.presentationLinks.update(links => new Map(links).set(solutionId, href));
      });
  }
  open(row: SolutionManagerSolutionRow, team = false, history = false): void {
    this.cancelDetail.next();
    this.detail.set(null);
    this.detailError.set(null);
    this.teamTab.set(team);
    this.historyOpen.set(false);
    this.history.set(null);
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.get
      .execute(this.activeProgram, row.application.solutionId)
      .pipe(takeUntil(this.cancelDetail), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.detailLoading.set(false);
        if (result.ok) {
          this.detail.set(result.value);
          this.materials.set(
            new FormGroup(
              Object.fromEntries(
                result.value.answers.map(a => [String(a.fieldId), new FormControl(a.value)]),
              ),
            ),
          );
          if (history) this.openHistory();
        } else this.detailError.set(result.error.detail);
      });
  }
  closeDetail(): void {
    if (this.applying()) return;
    this.cancelDetail.next();
    this.detailOpen.set(false);
    this.restoreFocus();
  }
  openHistory(): void {
    const detail = this.detail();
    if (!detail) return;
    this.historyOpen.set(true);
    this.historyLoading.set(true);
    this.detailError.set(null);
    this.historyApi
      .execute(this.activeProgram, detail.id, { limit: 100 })
      .pipe(takeUntil(this.cancelDetail), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.historyLoading.set(false);
        if (result.ok) this.history.set(result.value);
        else this.detailError.set(result.error.detail);
      });
  }
  beginAction(request: ActionRequest): void {
    if (this.applying()) return;
    this.detailOpen.set(false);
    this.cancelAction.next();
    this.actionRequest.set(request);
    this.actionPreview.set(null);
    this.actionError.set(null);
    this.actionLoading.set(true);
    const programId = this.activeProgram;
    const stream =
      request.kind === "submit"
        ? this.submitPreview.execute(programId, { action: "submit", ids: request.ids }).pipe(
            map(result =>
              result.ok
                ? {
                    ok: true as const,
                    value: {
                      token: result.value.previewToken,
                      canApply: result.value.canApply,
                      issues: result.value.items.flatMap(item =>
                        item.errors.map(e => `${item.application.name}: ${e.detail}`),
                      ),
                      scores: 0,
                      removedAssignments: 0,
                      invitations: 0,
                    },
                  }
                : result,
            ),
          )
        : request.kind === "archive"
          ? this.archivePreview.execute(programId, { ids: request.ids }).pipe(
              map(result =>
                result.ok
                  ? {
                      ok: true as const,
                      value: {
                        token: result.value.previewToken,
                        canApply: result.value.canApply,
                        issues: result.value.items.flatMap(item =>
                          item.errors.map(e => `${item.application.name}: ${e.detail}`),
                        ),
                        scores: result.value.scoreCount,
                        removedAssignments: result.value.removedAssignmentsCount,
                        invitations: result.value.revokedInvitationCount,
                      },
                    }
                  : result,
              ),
            )
          : this.memberPreview
              .execute(programId, request.ids[0], { userId: request.member.user.id })
              .pipe(
                map(result =>
                  result.ok
                    ? {
                        ok: true as const,
                        value: {
                          token: result.value.previewToken,
                          canApply: result.value.canApply,
                          issues: result.value.errors.map(e => e.detail),
                          scores: result.value.scoreCount,
                          removedAssignments: 0,
                          invitations: result.value.revokedInvitationCount,
                        },
                      }
                    : result,
                ),
              );
    stream
      .pipe(takeUntil(this.cancelAction), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.actionLoading.set(false);
        if (result.ok) this.actionPreview.set(result.value);
        else this.actionError.set(result.error.detail);
      });
  }
  confirmAction(): void {
    const request = this.actionRequest(),
      preview = this.actionPreview();
    if (!request || !preview?.canApply || !preview.token || this.applying()) return;
    this.applying.set(true);
    const programId = this.activeProgram;
    this.busyChange.emit(true);
    this.actionError.set(null);
    const stream =
      request.kind === "submit"
        ? this.submitApply
            .execute(this.activeProgram, {
              action: "submit",
              ids: request.ids,
              previewToken: preview.token,
            })
            .pipe(map(result => (result.ok ? { ok: true as const } : result)))
        : request.kind === "archive"
          ? this.archiveApply
              .execute(this.activeProgram, { ids: request.ids, previewToken: preview.token })
              .pipe(map(result => (result.ok ? { ok: true as const } : result)))
          : this.memberApply
              .execute(this.activeProgram, request.ids[0], {
                userId: request.member.user.id,
                previewToken: preview.token,
              })
              .pipe(map(result => (result.ok ? { ok: true as const } : result)));
    stream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.applying.set(false);
      this.busyChange.emit(false);
      this.actionPreview.set(null);
      if (this.activeProgram !== programId || this.actionRequest() !== request) return;
      if (result.ok) {
        this.actionRequest.set(null);
        this.detailOpen.set(false);
        this.selected.set(new Set());
        this.message.set("Изменения сохранены.");
        this.load();
        this.restoreFocus();
      } else this.actionError.set(result.error.detail);
    });
  }
  closeAction(): void {
    if (!this.applying()) {
      this.cancelAction.next();
      this.actionRequest.set(null);
      this.restoreFocus();
    }
  }
  retryAction(): void {
    const request = this.actionRequest();
    if (request) this.beginAction(request);
  }
  memberName(): string {
    const request = this.actionRequest();
    return request?.kind === "member"
      ? `${request.member.user.firstName} ${request.member.user.lastName}`
      : "";
  }
  historyLabel(action: string): string {
    return (
      (
        {
          change_case: "Смена кейса",
          remove_member: "Исключение участника",
          archive: "Заявка перемещена в архив",
          remove_registrations: "Удаление регистрации",
        } as Record<string, string>
      )[action] ?? action
    );
  }
  caseChanged(): void {
    this.caseRequest.set(null);
    this.detailOpen.set(false);
    this.message.set("Кейс изменен. Материалы, команда и оценки сохранены.");
    this.load();
    this.restoreFocus();
  }
  openAllocation(trigger: HTMLElement): void {
    if (!this.selected().size || !this.program().isCompetitive) return;
    this.trigger = trigger;
    this.allocationRequest.set({ programId: this.activeProgram, ids: [...this.selected()] });
  }
  allocationCompleted(): void {
    this.allocationRequest.set(null);
    this.message.set("Назначения экспертов сохранены.");
    this.clear();
    this.load();
    this.restoreFocus();
  }
  restoreFocus(): void {
    const trigger = this.trigger;
    setTimeout(() => {
      if (trigger?.isConnected) trigger.focus();
      else
        this.element.nativeElement
          .querySelector<HTMLInputElement>("#solution-management-search")
          ?.focus();
    });
  }
}
