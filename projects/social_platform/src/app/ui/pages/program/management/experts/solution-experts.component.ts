/** @format */

import { DialogHeaderComponent, SectionHeaderComponent } from "@uilib";

import {
  expertAssignmentsAction,
  type ExpertDialogIssue,
  expertScopeLabel,
  expertStatusLabel,
  expertDeliveryLabel,
  expertDialogBodyClass,
} from "./expert-presentation";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import {
  catchError,
  EMPTY,
  exhaustMap,
  filter,
  finalize,
  forkJoin,
  map,
  merge,
  Observable,
  Subject,
  takeUntil,
  timer,
} from "rxjs";
import { A11yModule } from "@angular/cdk/a11y";
import {
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  AlertDirective,
  IconComponent,
  StateComponent,
} from "@uilib";
import {
  RowAction,
  RowActionEvent,
  RowActionsComponent,
} from "@ui/primitives/row-actions/row-actions.component";
import { presentationHref } from "@utils/program-case-analytics";
import { evaluationError } from "@utils/evaluation-workspace";
import { AppRoutes } from "@api/paths/app-routes";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import {
  GetSolutionExpertAssignmentsUseCase,
  SaveSolutionExpertAssignmentsUseCase,
  PreviewSolutionQuotaUseCase,
  SaveSolutionQuotaUseCase,
} from "@api/solution/use-cases/solution-evaluation.use-cases";
import {
  GetSolutionManagerAssignmentsUseCase,
  GetSolutionManagerSolutionsUseCase,
} from "@api/solution/use-cases/solution-manager-analytics.use-cases";
import { ExpertRow } from "@domain/program/evaluation-workspace.model";
import {
  SolutionAssignmentOptions,
  SolutionManagerAssignment,
  SolutionManagerSolutionRow,
  SolutionQuota,
} from "@domain/solution/solution-contract.model";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { SolutionAllocationComponent } from "../solution-applications/solution-allocation.component";
import { exportExperts } from "@utils/export-experts";
import { ExpertRosterComponent } from "./expert-roster.component";
import { ExpertQuotaComponent } from "./expert-quota.component";

/** Program experts keep their existing invitation/case-scope API. Assignment IDs and counters come only from solutions. */
@Component({
  selector: "app-solution-experts",
  imports: [
    DialogHeaderComponent,
    SectionHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    A11yModule,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    AlertDirective,
    IconComponent,
    StateComponent,
    RowActionsComponent,
    ModalComponent,
    SolutionAllocationComponent,
    ExpertRosterComponent,
    ExpertQuotaComponent,
  ],
  templateUrl: "./solution-experts.component.html",
  styleUrls: [
    "../program-native-button.scss",
    "../program-native-field.scss",
    "../program-native-choice.scss",
    "./expert-table.scss",
    "./experts.component.scss",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionExpertsComponent {
  readonly dialogBodyClass = expertDialogBodyClass;
  readonly programId = input.required<number>();
  readonly floatingPosition = input<{ center: number; width: number; rosterWidth: number } | null>(
    null,
  );
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly expertsRequested = output<void>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  private readonly snackbar = inject(SnackbarService);
  private readonly roster = inject(EvaluationUseCase);
  private readonly assignmentsApi = inject(GetSolutionManagerAssignmentsUseCase);
  private readonly solutionsApi = inject(GetSolutionManagerSolutionsUseCase);
  private readonly optionsApi = inject(GetSolutionExpertAssignmentsUseCase);
  private readonly saveApi = inject(SaveSolutionExpertAssignmentsUseCase);
  private readonly quotaApi = inject(PreviewSolutionQuotaUseCase);
  private readonly saveQuotaApi = inject(SaveSolutionQuotaUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancel = new Subject<void>();
  private readonly cancelDialog = new Subject<void>();
  readonly experts = signal<ExpertRow[]>([]);
  readonly assignments = signal<SolutionManagerAssignment[]>([]);
  readonly solutions = signal<SolutionManagerSolutionRow[]>([]);
  readonly revision = signal("");
  readonly required = signal(1);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly allocationBusy = signal(false);
  readonly error = signal("");
  readonly dialogError = signal<ExpertDialogIssue | null>(null);
  readonly exporting = signal(false);
  readonly filtersOpen = signal(false);
  readonly filterDraft = new FormGroup({
    status: new FormControl("all", { nonNullable: true }),
    case: new FormControl("all", { nonNullable: true }),
    expert: new FormControl("all", { nonNullable: true }),
    unassigned: new FormControl(false, { nonNullable: true }),
  });
  readonly page = signal(0);
  readonly pageSize = 20;
  readonly distributionSelection = signal(new Set<number>());
  readonly tab = input<"experts" | "distribution">("experts");
  readonly allocationExpertId = input<number | null>(null);
  readonly modal = signal<"invite" | "scope" | "assignments" | "method" | null>(null);
  readonly selected = signal<ExpertRow | null>(null);
  readonly selectedExperts = signal(new Set<number | string>());
  readonly bulkScope = signal(false);
  readonly options = signal<SolutionAssignmentOptions | null>(null);
  readonly selectedSolutions = signal(new Set<number>());
  readonly allocation = signal<{ programId: number; ids: number[] } | null>(null);
  readonly quotaPreview = signal<SolutionQuota | null>(null);
  readonly scopeAll = signal(true);
  readonly scopeCases = signal(new Set<string | null>());
  readonly cases = signal<string[]>([]);
  readonly search = new FormControl("", { nonNullable: true });
  readonly searchValue = toSignal(this.search.valueChanges, { initialValue: "" });
  readonly distributionSearch = new FormControl("", { nonNullable: true });
  readonly distributionSearchValue = toSignal(this.distributionSearch.valueChanges, {
    initialValue: "",
  });
  readonly status = new FormControl("all", { nonNullable: true });
  readonly statusValue = toSignal(this.status.valueChanges, { initialValue: "all" });
  readonly caseFilter = new FormControl("all", { nonNullable: true });
  readonly caseValue = toSignal(this.caseFilter.valueChanges, { initialValue: "all" });
  readonly expertFilter = new FormControl("all", { nonNullable: true });
  readonly expertValue = toSignal(this.expertFilter.valueChanges, { initialValue: "all" });
  readonly joined = computed(() => this.experts().filter(expert => expert.status === "joined"));
  readonly email = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.email, Validators.maxLength(254)],
  });
  readonly emailValue = toSignal(this.email.valueChanges, { initialValue: "" });
  readonly quota = new FormControl<number | null>(1, {
    validators: [
      Validators.required,
      Validators.min(1),
      Validators.max(1000),
      Validators.pattern(/^\d+$/),
    ],
  });
  readonly quotaValue = toSignal(this.quota.valueChanges, { initialValue: 1 });
  readonly quotaChanged = computed(() => this.quotaValue() !== this.required());
  readonly paths = AppRoutes;
  readonly href = presentationHref;
  initials(expert: ExpertRow): string {
    return (expert.name || expert.email)
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0])
      .join("");
  }
  rowActions(expert: ExpertRow): RowAction[] {
    return [
      { id: "scope", label: "Изменить кейсы" },
      ...(expert.status === "joined"
        ? [
            expertAssignmentsAction(this.programId(), expert),
            { id: "assignments", label: "Назначить решения" },
          ]
        : [
            { id: "resend", label: "Отправить повторно" },
            {
              id: "revoke",
              label: "Отозвать приглашение",
              destructive: true,
              disabled: expert.status === "revoked",
            },
          ]),
    ];
  }
  rowAction(expert: ExpertRow, event: RowActionEvent): void {
    if (this.busy() || this.allocationBusy()) return;
    if (event.id === "scope" || event.id === "assignments") this.open(event.id, expert);
    else if (event.id === "resend" || event.id === "revoke")
      this.invitationAction(expert, event.id);
  }
  readonly caseKey = JSON.stringify;
  private readonly initialScope = signal("all");
  private scopeKey(): string {
    return this.scopeAll() ? "all" : JSON.stringify([...this.scopeCases()].sort());
  }
  readonly dirty = computed(() => {
    switch (this.modal()) {
      case "invite":
        return !!this.emailValue() || this.scopeKey() !== "all";
      case "scope":
        return this.scopeKey() !== this.initialScope();
      case "method":
        return this.quotaChanged();
      case "assignments": {
        const before =
          this.options()
            ?.solutions.filter(item => item.assigned)
            .map(item => item.solutionId)
            .sort((a, b) => a - b) ?? [];
        return (
          JSON.stringify(before) !==
          JSON.stringify([...this.selectedSolutions()].sort((a, b) => a - b))
        );
      }
      default:
        return false;
    }
  });
  readonly filtered = computed(() =>
    this.experts().filter(expert => {
      const q = this.searchValue().trim().toLocaleLowerCase("ru");
      return (
        `${expert.name ?? ""} ${expert.email}`.toLocaleLowerCase("ru").includes(q) &&
        (this.statusValue() === "all" || expert.status === this.statusValue())
      );
    }),
  );
  readonly filteredSolutions = computed(() => {
    const expert = this.expertValue();
    const query = this.distributionSearchValue().trim().toLocaleLowerCase("ru");
    const assigned = new Set(
      this.assignments()
        .filter(row => expert === "unassigned" || "expert:" + row.expert.expertId === expert)
        .map(row => row.application.solutionId),
    );
    return this.solutions().filter(
      row =>
        row.application.name.toLocaleLowerCase("ru").includes(query) &&
        (this.caseValue() === "all" || JSON.stringify(row.caseName) === this.caseValue()) &&
        (expert === "all" ||
          assigned.has(row.application.solutionId) === (expert !== "unassigned")),
    );
  });
  readonly visible = computed(() =>
    this.filtered().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize),
  );
  readonly allExpertsSelected = computed(
    () => !!this.filtered().length && this.filtered().every(e => this.selectedExperts().has(e.id)),
  );
  readonly allSolutionsSelected = computed(
    () =>
      !!this.filteredSolutions().length &&
      this.filteredSolutions().every(row =>
        this.distributionSelection().has(row.application.solutionId),
      ),
  );
  readonly filterCount = computed(() =>
    this.tab() === "experts"
      ? Number(this.statusValue() !== "all")
      : Number(this.caseValue() !== "all") + Number(this.expertValue() !== "all"),
  );
  readonly filtersActive = computed(
    () =>
      !!(this.tab() === "experts" ? this.searchValue() : this.distributionSearchValue()).trim() ||
      !!this.filterCount(),
  );
  readonly listHeading = computed(() => {
    if (this.tab() === "distribution") return "Распределение экспертов";
    return this.loading() || this.error() ? "Эксперты" : `Эксперты · ${this.experts().length}`;
  });
  readonly distributionActions: RowAction[] = [{ id: "assign", label: "Назначить экспертов" }];
  readonly rosterActions = (expert: ExpertRow) => this.rowActions(expert);
  selectAllExperts(): void {
    if (this.busy() || this.loading()) return;
    this.selectedExperts.set(
      this.allExpertsSelected() ? new Set() : new Set(this.filtered().map(e => e.id)),
    );
  }
  expertRowClick(event: MouseEvent, expert: ExpertRow): void {
    const target = event.target;
    if (
      event.defaultPrevented ||
      !(target instanceof Element) ||
      target.closest("a,button,input,label,select,textarea,app-row-actions,.experts__row-actions")
    )
      return;
    if (target.ownerDocument.defaultView?.getSelection()?.toString()) return;
    this.toggleExpert(expert.id);
  }
  clearDistributionSelection(): void {
    this.distributionSelection.set(new Set());
  }
  toggleDistribution(id: number): void {
    if (this.busy() || this.loading() || this.allocationBusy()) return;
    const ids = new Set(this.distributionSelection());
    ids.has(id) ? ids.delete(id) : ids.add(id);
    this.distributionSelection.set(ids);
  }
  selectAllSolutions(): void {
    if (this.busy() || this.loading() || this.allocationBusy()) return;
    this.distributionSelection.set(
      this.allSolutionsSelected()
        ? new Set()
        : new Set(this.filteredSolutions().map(row => row.application.solutionId)),
    );
  }
  openFilters(): void {
    this.filterDraft.setValue({
      status: this.status.value,
      case: this.caseFilter.value,
      expert: this.expertFilter.value === "unassigned" ? "all" : this.expertFilter.value,
      unassigned: this.expertFilter.value === "unassigned",
    });
    this.filtersOpen.set(true);
  }
  applyFilters(): void {
    const draft = this.filterDraft.getRawValue();
    if (this.tab() === "experts") {
      if (draft.status !== this.status.value) this.status.setValue(draft.status);
    } else {
      if (draft.case !== this.caseFilter.value) this.caseFilter.setValue(draft.case);
      const expert = draft.unassigned ? "unassigned" : draft.expert;
      if (expert !== this.expertFilter.value) this.expertFilter.setValue(expert);
    }
    this.filtersOpen.set(false);
  }
  resetFilterDraft(): void {
    this.filterDraft.setValue({ status: "all", case: "all", expert: "all", unassigned: false });
  }
  toggleExpert(id: number | string): void {
    if (this.busy()) return;
    const ids = new Set(this.selectedExperts());
    ids.has(id) ? ids.delete(id) : ids.add(id);
    this.selectedExperts.set(ids);
  }
  readonly canBulkInvite = computed(() => {
    const rows = this.filtered().filter(expert => this.selectedExperts().has(expert.id));
    return (
      rows.length > 0 && rows.every(expert => expert.status !== "joined" && !!expert.invitationId)
    );
  });
  clearSelectedExperts(): void {
    this.selectedExperts.set(new Set());
  }
  bulk(action: "cases" | "resend" | "revoke"): void {
    const rows = this.filtered().filter(expert => this.selectedExperts().has(expert.id));
    if (!rows.length || this.busy()) return;
    if (action !== "cases" && !this.canBulkInvite()) return;
    if (action === "cases" && !this.bulkScope()) {
      this.open("scope");
      this.bulkScope.set(true);
      return;
    }
    this.write(
      this.roster.bulkExperts(this.programId(), {
        action,
        revision: this.revision(),
        expertIds: rows.filter(e => e.status === "joined").map(e => Number(e.id)),
        invitationIds: rows
          .filter(e => e.status !== "joined" && e.invitationId)
          .map(e => e.invitationId!),
        allCases: this.scopeAll(),
        caseNames: this.scopeAll() ? [] : [...this.scopeCases()],
      }),
      "Изменения для выбранных экспертов сохранены.",
    );
  }
  constructor() {
    this.search.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.page.set(0);
      this.clearSelectedExperts();
    });
    this.status.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.page.set(0);
      this.clearSelectedExperts();
    });
    merge(
      this.caseFilter.valueChanges,
      this.expertFilter.valueChanges,
      this.distributionSearch.valueChanges,
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.clearDistributionSelection());
    effect(() => {
      const expertId = this.allocationExpertId();
      const expert = expertId ? "expert:" + expertId : "all";
      if (expert !== this.expertFilter.value) untracked(() => this.expertFilter.setValue(expert));
    });
    effect(() => {
      this.tab();
      this.filtersOpen.set(false);
    });
    timer(4000, 4000)
      .pipe(
        filter(
          () =>
            !this.busy() &&
            !this.loading() &&
            this.experts().some(e => e.status === "pending" && e.deliveryStatus === "queued"),
        ),
        exhaustMap(() => {
          const id = this.programId();
          return this.roster.workspace(id).pipe(
            map(data => ({ id, data })),
            catchError(() => EMPTY),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ id, data }) => {
        if (id !== this.programId() || this.busy()) return;
        this.selectedExperts.update(
          ids => new Set([...ids].filter(id => data.experts.some(expert => expert.id === id))),
        );
        this.experts.update(rows =>
          data.experts.map(expert => {
            const counts = rows.find(e => e.id === expert.id);
            return expert.status === "joined"
              ? {
                  ...expert,
                  assigned: counts?.assigned ?? 0,
                  completed: counts?.completed ?? 0,
                  remaining: counts?.remaining ?? 0,
                }
              : expert;
          }),
        );
      });
    effect(() => {
      this.programId();
      untracked(() => {
        this.cancelDialog.next();
        this.discard();
        this.load();
      });
    });
    effect(() => {
      this.statusChange.emit({ dirty: this.dirty(), busy: this.busy() || this.allocationBusy() });
    });
    this.quota.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.quotaPreview.set(null);
    });
  }
  load(): void {
    if (this.busy() || this.allocationBusy()) return;
    this.cancel.next();
    this.loading.set(true);
    this.error.set("");
    this.experts.set([]);
    this.assignments.set([]);
    this.solutions.set([]);
    this.selectedExperts.set(new Set());
    this.distributionSelection.set(new Set());
    this.page.set(0);
    this.filtersOpen.set(false);
    const id = this.programId();
    forkJoin({ roster: this.roster.workspace(id), assignments: this.assignmentsApi.execute(id) })
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.assignments.ok) {
            this.loading.set(false);
            this.error.set("Не удалось загрузить назначения решений.");
            return;
          }
          this.revision.set(result.roster.revision);
          this.required.set(result.roster.requiredEvaluators);
          this.cases.set(result.roster.cases ?? []);
          this.assignments.set(result.assignments.value.results);
          this.experts.set(
            result.roster.experts.map(expert => {
              if (expert.status !== "joined") return expert;
              const rows = result.assignments.ok
                ? result.assignments.value.results.filter(a => a.expert.expertId === expert.id)
                : [];
              const completed = rows.filter(a => a.status === "completed").length;
              return {
                ...expert,
                assigned: rows.length,
                completed,
                remaining: rows.length - completed,
              };
            }),
          );
          this.loadSolutions(0, []);
        },
        error: () => {
          this.loading.set(false);
          this.error.set("Не удалось загрузить экспертов программы.");
        },
      });
  }
  private loadSolutions(offset: number, rows: SolutionManagerSolutionRow[]): void {
    this.solutionsApi
      .execute(this.programId(), { submission: "submitted", limit: 100, offset })
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          this.loading.set(false);
          this.error.set("Не удалось загрузить решения для распределения.");
          return;
        }
        const all = [...rows, ...result.value.results];
        if (all.length < result.value.count && result.value.results.length)
          this.loadSolutions(offset + result.value.results.length, all);
        else {
          this.solutions.set(all);
          this.loading.set(false);
        }
      });
  }
  counts(solutionId: number): { assigned: number; completed: number } {
    const rows = this.assignments().filter(a => a.application.solutionId === solutionId);
    return { assigned: rows.length, completed: rows.filter(a => a.status === "completed").length };
  }
  open(kind: "invite" | "scope" | "assignments" | "method", expert: ExpertRow | null = null): void {
    if (this.busy() || this.loading() || this.allocationBusy()) return;
    this.cancelDialog.next();
    this.selected.set(expert);
    this.bulkScope.set(false);
    this.options.set(null);
    this.selectedSolutions.set(new Set());
    this.dialogError.set(null);
    this.quotaPreview.set(null);
    this.email.reset("");
    this.scopeAll.set(expert?.allCases ?? true);
    this.scopeCases.set(new Set(expert?.caseNames ?? []));
    this.initialScope.set(this.scopeKey());
    if (kind === "method") this.resetQuota();
    this.modal.set(kind);
    if (kind === "assignments" && expert?.status === "joined") {
      this.optionsApi
        .execute(this.programId(), Number(expert.id))
        .pipe(takeUntil(this.cancelDialog), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          if (result.ok) {
            this.options.set(result.value);
            this.selectedSolutions.set(
              new Set(result.value.solutions.filter(s => s.assigned).map(s => s.solutionId)),
            );
          } else {
            this.dialogError.set({
              message: "Не удалось загрузить назначения эксперта.",
              kind: "refresh",
            });
          }
        });
    }
  }
  toggleScope(name: string | null): void {
    if (this.busy()) return;
    const values = this.scopeAll()
      ? new Set<string | null>([...this.cases(), null])
      : new Set(this.scopeCases());
    values.has(name) ? values.delete(name) : values.add(name);
    this.scopeCases.set(values);
    this.scopeAll.set(false);
  }
  toggleSolution(id: number): void {
    if (this.busy()) return;
    const option = this.options()?.solutions.find(s => s.solutionId === id);
    if (
      !option ||
      option.protected ||
      (!option.assigned && (!option.eligible || option.ownTeam || !option.submitted))
    )
      return;
    const values = new Set(this.selectedSolutions());
    values.has(id) ? values.delete(id) : values.add(id);
    this.selectedSolutions.set(values);
  }
  refreshDialog(): void {
    if (this.busy() || !this.modal()) return;
    this.cancelDialog.next();
    this.dialogError.set(null);
    const expert = this.selected();
    if (this.modal() === "assignments" && expert?.status === "joined") {
      this.options.set(null);
      this.optionsApi
        .execute(this.programId(), Number(expert.id))
        .pipe(takeUntil(this.cancelDialog), takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          if (!result.ok) {
            this.dialogError.set({
              message: "Не удалось обновить назначения. Повторите попытку.",
              kind: "refresh",
            });
            return;
          }
          const chosen = this.selectedSolutions(),
            fresh = result.value;
          const ids = new Set(
            fresh.solutions
              .filter(
                item =>
                  item.protected ||
                  (chosen.has(item.solutionId) &&
                    (item.assigned || (item.submitted && item.eligible && !item.ownTeam))),
              )
              .map(item => item.solutionId),
          );
          this.options.set(fresh);
          this.selectedSolutions.set(ids);
          if ([...chosen].some(id => !ids.has(id)))
            this.dialogError.set({
              message: "Часть выбранных решений стала недоступна. Проверьте обновленный выбор.",
            });
        });
    } else {
      this.roster
        .workspace(this.programId())
        .pipe(takeUntil(this.cancelDialog), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            this.revision.set(data.revision);
            this.cases.set(data.cases ?? []);
            this.quotaPreview.set(null);
          },
          error: () =>
            this.dialogError.set({
              message: "Не удалось обновить данные. Повторите попытку.",
              kind: "refresh",
            }),
        });
    }
  }
  private write<T>(request: Observable<T>, onSaved: string | ((data: T) => void)): void {
    if (this.busy()) return;
    const id = this.programId();
    this.busy.set(true);
    this.dialogError.set(null);
    this.error.set("");
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.busy.set(false);
        if (id !== this.programId()) {
          this.load();
          return;
        }
        if (typeof onSaved === "function") {
          onSaved(data);
          return;
        }
        this.discard();
        this.snackbar.success(onSaved);
        this.load();
      },
      error: error => {
        this.busy.set(false);
        if (id !== this.programId()) {
          this.load();
          return;
        }
        this.quotaPreview.set(null);
        this.options.set(null);
        const modal = this.modal();
        const status = error instanceof HttpErrorResponse ? error.status : null;
        if (modal === "assignments" || modal === "method" || (modal && status === 409)) {
          this.dialogError.set({
            message: "Изменение не сохранено. Обновите данные и повторите попытку.",
            kind: "refresh",
          });
        } else if (modal && status === 400) {
          this.dialogError.set({ message: evaluationError(error) });
        } else {
          this.snackbar.error("Не удалось сохранить изменения. Повторите попытку.");
        }
      },
    });
  }
  invite(): void {
    if (this.busy()) return;
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    if (!this.scopeAll() && !this.scopeCases().size) {
      this.dialogError.set({
        message: "Выберите хотя бы один кейс или отметьте «Все кейсы».",
        kind: "case-selection",
      });
      return;
    }
    this.write(
      this.roster.invite(this.programId(), this.email.value.trim(), {
        allCases: this.scopeAll(),
        caseNames: this.scopeAll() ? [] : [...this.scopeCases()],
      }),
      "Приглашение создано. Письмо поставлено в очередь.",
    );
  }
  invitationAction(expert: ExpertRow, action: "resend" | "revoke"): void {
    if (this.busy()) return;
    if (expert.invitationId)
      this.write(
        this.roster.invitationAction(this.programId(), expert.invitationId, action),
        action === "resend" ? "Приглашение отправлено повторно." : "Приглашение отозвано.",
      );
  }
  saveScope(): void {
    if (this.busy()) return;
    if (this.bulkScope()) {
      this.bulk("cases");
      return;
    }
    const expert = this.selected();
    if (!expert || (!this.scopeAll() && !this.scopeCases().size)) return;
    const command = {
      revision: this.revision(),
      allCases: this.scopeAll(),
      caseNames: this.scopeAll() ? [] : [...this.scopeCases()],
    };
    this.write(
      expert.status === "joined"
        ? this.roster.saveCaseScope(this.programId(), Number(expert.id), command)
        : this.roster.saveInvitationCaseScope(this.programId(), expert.invitationId!, command),
      "Кейсы эксперта сохранены. Текущие назначения остаются.",
    );
  }
  saveAssignments(): void {
    if (this.busy()) return;
    const options = this.options();
    if (!options) return;
    this.write(
      this.saveApi
        .execute(this.programId(), options.expertId, {
          revision: options.revision,
          solutionIds: [...this.selectedSolutions()],
        })
        .pipe(
          map(result => {
            if (!result.ok) throw result.error;
            return result.value;
          }),
        ),
      "Решения назначены эксперту.",
    );
  }
  resetQuota(): void {
    this.quota.reset(this.required());
    this.dialogError.set(null);
  }
  previewQuota(): void {
    const value = this.quota.value;
    if (
      this.modal() !== "method" ||
      this.quota.invalid ||
      this.busy() ||
      value === null ||
      !this.quotaChanged()
    )
      return;
    this.cancelDialog.next();
    this.quotaPreview.set(null);
    this.dialogError.set(null);
    this.busy.set(true);
    this.quotaApi
      .execute(this.programId(), value)
      .pipe(
        takeUntil(this.cancelDialog),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
      )
      .subscribe(result => {
        if (value !== this.quota.value) return;
        if (result.ok) this.quotaPreview.set(result.value);
        else this.snackbar.error("Не удалось проверить новое число оценщиков.");
      });
  }
  saveQuota(): void {
    if (this.modal() !== "method" || this.busy() || !this.quotaChanged()) return;
    const p = this.quotaPreview();
    if (!p || p.requiredEvaluators !== this.quota.value) return;
    this.write(
      this.saveQuotaApi
        .execute(this.programId(), {
          revision: p.revision,
          requiredEvaluators: p.requiredEvaluators,
        })
        .pipe(
          map(result => {
            if (!result.ok) throw result.error;
            return result.value;
          }),
        ),
      data => {
        this.revision.set(data.revision);
        this.required.set(data.requiredEvaluators);
        this.quota.reset(data.requiredEvaluators);
        this.snackbar.success("Готовность решений пересчитана.");
      },
    );
  }
  async goToExpertsForAllocation(): Promise<void> {
    await this.close();
    if (!this.modal()) this.expertsRequested.emit();
  }
  startAutomaticAllocation(): void {
    if (
      this.modal() !== "method" ||
      this.busy() ||
      this.loading() ||
      this.allocationBusy() ||
      this.quotaChanged()
    )
      return;
    if (!this.distributionSelection().size && !this.filteredSolutions().length) return;
    this.discard();
    this.startAllocation();
  }
  startAllocation(
    ids = this.distributionSelection().size
      ? [...this.distributionSelection()]
      : this.filteredSolutions().map(row => row.application.solutionId),
  ): void {
    if (!this.busy() && !this.allocationBusy() && !this.loading() && ids.length)
      this.allocation.set({
        programId: this.programId(),
        ids,
      });
  }
  async close(): Promise<void> {
    if (this.busy()) return;
    if (this.dirty() && !(await this.confirmDiscard()())) return;
    this.discard();
  }
  discard(): void {
    this.cancelDialog.next();
    this.modal.set(null);
    this.options.set(null);
    this.quotaPreview.set(null);
    this.selected.set(null);
    this.dialogError.set(null);
  }
  async downloadExperts(): Promise<void> {
    if (this.exporting()) return;
    const programId = this.programId();
    this.exporting.set(true);
    try {
      await exportExperts(
        programId,
        this.filtered().map(e => ({
          name: e.name ?? "",
          email: e.email,
          cases: expertScopeLabel(e),
          status: expertStatusLabel(e),
          delivery: expertDeliveryLabel(e),
          assigned: e.assigned,
          completed: e.completed,
          remaining: e.remaining,
        })),
      );
      if (!this.destroyRef.destroyed && this.programId() === programId)
        this.snackbar.success("Excel с экспертами по текущим фильтрам готов.");
    } catch {
      if (!this.destroyRef.destroyed && this.programId() === programId)
        this.snackbar.error("Не удалось выгрузить экспертов. Повторите попытку.");
    } finally {
      if (!this.destroyRef.destroyed) this.exporting.set(false);
    }
  }
}
