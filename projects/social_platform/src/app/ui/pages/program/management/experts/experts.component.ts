/** @format */
import {
  ChangeDetectionStrategy,
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import {
  Observable,
  catchError,
  exhaustMap,
  filter,
  finalize,
  of,
  take,
  timeout,
  timer,
} from "rxjs";
import { PluralizePipe } from "@corelib";
import {
  AlertDirective,
  AvatarComponent,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
} from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import {
  RowAction,
  RowActionEvent,
  RowActionsComponent,
} from "@ui/primitives/row-actions/row-actions.component";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { ProgramProjectAssignmentSelection } from "@api/program/facades/detail/program-project-assignment-selection.service";
import {
  AllocationPlan,
  ExpertRow,
  ExpertWorkspace,
  QuotaPreview,
  DistributionProject,
  CaseExpertPool,
} from "@domain/program/evaluation-workspace.model";
import { evaluationError } from "@utils/evaluation-workspace";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-management-experts",
  imports: [
    ReactiveFormsModule,
    AlertDirective,
    AvatarComponent,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    ModalComponent,
    RowActionsComponent,
    PluralizePipe,
    NgTemplateOutlet,
  ],
  templateUrl: "./experts.component.html",
  styleUrl: "./experts.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementExpertsComponent {
  readonly programId = input.required<number>();
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  private readonly api = inject(EvaluationUseCase);
  private readonly incomingAssignment = inject(ProgramProjectAssignmentSelection);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  readonly floatingCenter = signal<number | null>(null);
  readonly floatingWidth = signal<number | null>(null);
  readonly snapshot = signal<ExpertWorkspace | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly deliveryRefreshPaused = signal(false);
  readonly selected = signal<ExpertRow | null>(null);
  readonly selectedExpertIds = signal(new Set<number | string>());
  readonly selectedExpertRows = computed(() =>
    this.filtered().filter(e => this.selectedExpertIds().has(e.id)),
  );
  readonly allExpertsSelected = computed(
    () =>
      !!this.filtered().length && this.filtered().every(e => this.selectedExpertIds().has(e.id)),
  );
  readonly canBulkInvite = computed(
    () =>
      !!this.selectedExpertRows().length &&
      this.selectedExpertRows().every(e => e.status !== "joined" && !!e.invitationId),
  );
  readonly bulkScope = signal(false);
  readonly bulkRevoke = signal(false);
  readonly modal = signal<
    "invite" | "auto" | "quota" | "revoke" | "method" | "project" | "scope" | "pool" | null
  >(null);
  readonly plan = signal<AllocationPlan | null>(null);
  readonly quotaPreview = signal<QuotaPreview | null>(null);
  readonly chosenExperts = signal(new Set<number>());
  readonly search = this.fb.control("");
  readonly status = this.fb.control("all");
  readonly email = this.fb.control("", [
    Validators.required,
    Validators.email,
    Validators.maxLength(254),
  ]);
  private readonly inviteEmail = toSignal(this.email.valueChanges, { initialValue: "" });
  readonly quota = this.fb.control(1, [
    Validators.required,
    Validators.min(1),
    Validators.max(1000),
    Validators.pattern(/^\d+$/),
  ]);
  private readonly query = signal("");
  private readonly statusValue = signal("all");
  readonly page = signal(0);
  readonly pageSize = 20;
  readonly href = presentationHref;
  readonly tab = signal<"experts" | "distribution">("experts");
  readonly distributionSearch = this.fb.control("");
  readonly distributionCase = this.fb.control("all");
  readonly distributionStatus = this.fb.control("all");
  readonly expertSearch = this.fb.control("");
  private readonly distributionQuery = signal("");
  private readonly distributionCaseValue = signal("all");
  private readonly distributionStatusValue = signal("all");
  private readonly expertQuery = signal("");
  readonly projectPage = signal(0);
  readonly selectedProjects = signal(new Set<number>());
  readonly assignmentTargets = signal<number[]>([]);
  readonly initialExperts = signal<number[]>([]);
  readonly scopeAll = signal(true);
  readonly scopeCases = signal(new Set<string | null>());
  readonly casePools = signal<CaseExpertPool[]>([]);
  readonly poolCase = signal<string | null>(null);
  readonly emptySelection = new Set<number>();
  readonly allProjects = computed(() => this.snapshot()?.projects ?? []);
  readonly caseNames = computed(() => this.snapshot()?.cases ?? []);
  readonly filteredDistribution = computed(() =>
    this.allProjects().filter(p => {
      const status = this.distributionStatusValue();
      return (
        p.name
          .toLocaleLowerCase("ru")
          .includes(this.distributionQuery().trim().toLocaleLowerCase("ru")) &&
        (this.distributionCaseValue() === "all" ||
          JSON.stringify(p.caseName) === this.distributionCaseValue()) &&
        (status === "all" ||
          (status === "unassigned" && !p.experts.length) ||
          (status === "missing" && p.experts.length < (this.snapshot()?.requiredEvaluators ?? 1)) ||
          (status === "completed" &&
            this.completed(p) >= (this.snapshot()?.requiredEvaluators ?? 1)) ||
          p.experts.some(e => "expert:" + e.expertId === status))
      );
    }),
  );
  readonly filteredMissing = computed(
    () =>
      this.filteredDistribution().filter(
        p => p.experts.length < (this.snapshot()?.requiredEvaluators ?? 1),
      ).length,
  );
  readonly distributionPage = computed(() =>
    this.filteredDistribution().slice(
      this.projectPage() * this.pageSize,
      (this.projectPage() + 1) * this.pageSize,
    ),
  );
  readonly selection = computed(() =>
    this.allProjects().filter(p => this.selectedProjects().has(p.id)),
  );
  readonly allVisibleSelected = computed(
    () =>
      !!this.filteredDistribution().length &&
      this.filteredDistribution().every(p => this.selectedProjects().has(p.id)),
  );
  readonly mixedProjectCases = computed(
    () => new Set(this.selection().map(p => p.caseName)).size > 1,
  );
  readonly hasProjectsWithoutCase = computed(() =>
    this.allProjects().some(p => p.caseName === null),
  );
  readonly targets = computed(() =>
    this.allProjects().filter(p => this.assignmentTargets().includes(p.id)),
  );
  readonly targetCase = computed(() => this.targets()[0]?.caseName ?? null);
  readonly targetNames = computed(() =>
    this.targets()
      .map(p => p.name)
      .join(" · "),
  );
  readonly autoGroups = computed(() => {
    const names: (string | null)[] = [...this.caseNames()];
    if (this.allProjects().some(p => p.caseName === null)) names.push(null);
    return names
      .map(name => ({
        name,
        count: this.allProjects().filter(p => p.caseName === name).length,
        missing: this.allProjects().filter(
          p => p.caseName === name && p.experts.length < (this.snapshot()?.requiredEvaluators ?? 1),
        ).length,
      }))
      .filter(g => g.count);
  });
  readonly canPreviewAllocation = computed(
    () =>
      this.autoGroups().some(g => g.missing) &&
      this.autoGroups()
        .filter(g => g.missing)
        .every(g => this.poolExperts(g.name).length),
  );
  readonly candidateExperts = computed(() =>
    (this.snapshot()?.experts ?? []).filter(
      e =>
        !this.expertQuery().trim() ||
        `${e.name ?? ""} ${e.email}`
          .toLocaleLowerCase("ru")
          .includes(this.expertQuery().trim().toLocaleLowerCase("ru")),
    ),
  );
  readonly projectDirty = computed(
    () =>
      this.modal() === "project" &&
      JSON.stringify([...this.chosenExperts()].sort((a, b) => a - b)) !==
        JSON.stringify([...this.initialExperts()].sort((a, b) => a - b)),
  );
  readonly projectLimitExceeded = computed(() => this.exceedsAssignmentLimit(this.chosenExperts()));
  readonly scopeDirty = computed(
    () =>
      this.modal() === "scope" &&
      (this.bulkScope()
        ? this.scopeAll() || !!this.scopeCases().size
        : !!this.selected() &&
          (this.scopeAll() !== (this.selected()!.allCases ?? true) ||
            (!this.scopeAll() &&
              JSON.stringify([...this.scopeCases()].sort()) !==
                JSON.stringify([...(this.selected()!.caseNames ?? [])].sort())))),
  );
  readonly joined = computed(
    () => this.snapshot()?.experts.filter(e => e.status === "joined") ?? [],
  );
  private readonly hasQueuedInvitations = computed(() =>
    this.snapshot()?.experts.some(e => e.status === "pending" && e.deliveryStatus === "queued"),
  );
  readonly filtered = computed(() =>
    (this.snapshot()?.experts ?? []).filter(
      e =>
        (this.statusValue() === "all" || e.status === this.statusValue()) &&
        `${e.name ?? ""} ${e.email}`
          .toLocaleLowerCase("ru")
          .includes(this.query().trim().toLocaleLowerCase("ru")),
    ),
  );
  readonly visible = computed(() =>
    this.filtered().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize),
  );
  readonly dirty = computed(
    () =>
      this.projectDirty() ||
      this.scopeDirty() ||
      (this.modal() === "invite" && (!!this.inviteEmail().trim() || !!this.scopeCases().size)),
  );
  readonly dialogTitle = computed(() => {
    switch (this.modal()) {
      case "invite":
        return "Пригласить эксперта";
      case "method":
        return "Распределить проекты";
      case "scope":
        return this.bulkScope() ? "Кейсы выбранных экспертов" : "Кейсы эксперта";
      case "pool":
        return "Эксперты для кейса «" + this.caseLabel(this.poolCase()) + "»";
      case "project":
        return this.targets().length > 1
          ? "Назначить экспертов нескольким проектам"
          : "Назначить экспертов";
      case "quota":
        return "Сколько оценок нужно каждому проекту";
      case "revoke":
        return "Отозвать приглашение";
      default:
        return this.plan()
          ? this.plan()!.shortages.length
            ? "Не хватает экспертов"
            : "Предпросмотр распределения"
          : "Автоматическое распределение";
    }
  });
  private loadSequence = 0;
  constructor() {
    afterNextRender(() => {
      const update = () => {
        const rect = this.element.nativeElement.getBoundingClientRect();
        if (rect.width > 0) {
          this.floatingCenter.set(rect.left + rect.width / 2);
          this.floatingWidth.set(Math.min(704, rect.width, window.innerWidth - 32));
        }
      };
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
      observer?.observe(this.element.nativeElement);
      window.addEventListener("resize", update);
      update();
      this.destroyRef.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener("resize", update);
      });
    });
    effect(() => {
      const id = this.programId();
      untracked(() => {
        this.snapshot.set(null);
        this.selected.set(null);
        this.selectedExpertIds.set(new Set());
        this.selectedProjects.set(new Set());
        this.tab.set("experts");
        this.load(id);
      });
    });
    effect(onCleanup => {
      const id = this.programId();
      this.deliveryRefreshPaused.set(false);
      if (!this.hasQueuedInvitations() || this.busy()) return;
      const subscription = timer(3000, 5000)
        .pipe(
          take(24),
          filter(() => !this.busy()),
          exhaustMap(() =>
            this.api.workspace(id).pipe(
              timeout(10000),
              catchError(() => of(null)),
            ),
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: data => {
            if (!data || this.programId() !== id || this.busy()) return;
            // Обновляем данные без пересоздания формы, сброса поиска и открытого редактора.
            this.snapshot.set(data);
            this.selected.update(row =>
              row ? (data.experts.find(e => e.id === row.id) ?? null) : null,
            );
          },
          complete: () => this.deliveryRefreshPaused.set(!!this.hasQueuedInvitations()),
        });
      onCleanup(() => subscription.unsubscribe());
    });
    effect(() => this.statusChange.emit({ dirty: this.dirty(), busy: this.busy() }));
    this.search.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.query.set(v);
      this.page.set(0);
      this.selected.set(null);
      this.selectedExpertIds.set(new Set());
    });
    this.status.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.statusValue.set(v);
      this.page.set(0);
      this.selected.set(null);
      this.selectedExpertIds.set(new Set());
    });
    this.quota.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.quotaPreview.set(null));
    this.distributionSearch.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.distributionQuery.set(v);
      this.projectPage.set(0);
      this.selectedProjects.set(new Set());
    });
    this.distributionCase.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.distributionCaseValue.set(v);
      this.projectPage.set(0);
      this.selectedProjects.set(new Set());
    });
    this.distributionStatus.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.distributionStatusValue.set(v);
      this.projectPage.set(0);
      this.selectedProjects.set(new Set());
    });
    this.expertSearch.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(v => this.expertQuery.set(v));
  }
  load(id = this.programId()): void {
    const seq = ++this.loadSequence;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .workspace(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (seq !== this.loadSequence) return;
          this.snapshot.set(data);
          this.loading.set(false);
          this.selected.set(data.experts.find(e => e.id === this.selected()?.id) ?? null);
          this.selectedProjects.update(
            ids => new Set([...ids].filter(id => data.projects?.some(p => p.id === id))),
          );
          this.selectedExpertIds.update(
            ids => new Set([...ids].filter(id => data.experts.some(e => e.id === id))),
          );
          const incoming = this.incomingAssignment.take(id);
          if (incoming?.length) {
            const targets = (data.projects ?? []).filter(p => incoming.includes(p.id));
            this.tab.set("distribution");
            if (
              targets.length !== incoming.length ||
              new Set(targets.map(p => p.caseName)).size > 1
            )
              this.error.set(
                "Выбранные проекты изменились. Выберите сданные проекты одного кейса заново.",
              );
            else {
              this.selectedProjects.set(new Set(incoming));
              this.openProject();
            }
          }
        },
        error: e => {
          if (seq !== this.loadSequence) return;
          this.error.set(evaluationError(e));
          this.loading.set(false);
        },
      });
  }
  private request<T>(request: Observable<T>, done: (data: T) => void): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.dialogError.set(null);
    this.error.set(null);
    request
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: done,
        error: e => {
          if (this.modal()) this.dialogError.set(evaluationError(e));
          else this.error.set(evaluationError(e));
        },
      });
  }
  select(row: ExpertRow): void {
    this.selected.set(this.selected()?.id === row.id ? null : row);
  }
  rowActions(row: ExpertRow): RowAction[] {
    const actions: RowAction[] = [{ id: "scope", label: "Кейсы эксперта" }];
    if (row.status === "joined")
      actions.unshift({ id: "assignments", label: "Посмотреть назначения" });
    else {
      actions.push({ id: "resend", label: "Отправить повторно" });
      if (row.status !== "revoked")
        actions.push({ id: "revoke", label: "Отозвать приглашение", destructive: true });
    }
    return actions;
  }
  rowAction(row: ExpertRow, event: RowActionEvent): void {
    if (this.busy()) return;
    this.selected.set(row);
    if (event.id === "scope") this.openScope(row);
    else if (event.id === "resend") this.invitationAction("resend");
    else if (event.id === "revoke") this.open("revoke");
    else if (event.id === "assignments") {
      this.switchTab("distribution");
      this.distributionStatus.setValue("expert:" + row.id);
    }
  }
  toggleSelectedExpert(row: ExpertRow): void {
    if (this.busy()) return;
    const ids = new Set(this.selectedExpertIds());
    ids.has(row.id) ? ids.delete(row.id) : ids.add(row.id);
    this.selectedExpertIds.set(ids);
  }
  selectAllExperts(): void {
    if (this.busy()) return;
    this.selectedExpertIds.set(
      this.allExpertsSelected() ? new Set() : new Set(this.filtered().map(e => e.id)),
    );
  }
  openBulkScope(): void {
    if (!this.selectedExpertRows().length || this.busy()) return;
    this.bulkScope.set(true);
    this.selected.set(null);
    this.scopeAll.set(false);
    this.scopeCases.set(new Set());
    this.dialogError.set(null);
    this.modal.set("scope");
  }
  openBulkRevoke(): void {
    if (!this.canBulkInvite() || this.busy()) return;
    this.open("revoke");
    this.bulkRevoke.set(true);
  }
  bulkExperts(action: "cases" | "resend" | "revoke"): void {
    const state = this.snapshot(),
      rows = this.selectedExpertRows();
    if (!state || !rows.length || (action !== "cases" && !this.canBulkInvite())) return;
    if (action === "cases" && !this.scopeAll() && !this.scopeCases().size) {
      this.dialogError.set("Выберите хотя бы один кейс или все кейсы.");
      return;
    }
    this.request(
      this.api.bulkExperts(this.programId(), {
        action,
        revision: state.revision,
        expertIds: rows.filter(e => e.status === "joined").map(e => Number(e.id)),
        invitationIds: rows.filter(e => e.status !== "joined").map(e => e.invitationId!),
        allCases: this.scopeAll(),
        caseNames: this.scopeAll() ? [] : [...this.scopeCases()],
      }),
      result => {
        this.snapshot.set(result);
        this.modal.set(null);
        this.selectedExpertIds.set(new Set());
        this.bulkScope.set(false);
        this.bulkRevoke.set(false);
        this.message.set(
          action === "cases"
            ? "Кейсы выбранных экспертов сохранены."
            : action === "resend"
              ? "Выбранные приглашения переданы на отправку."
              : "Выбранные приглашения отозваны.",
        );
      },
    );
  }
  distributionActions(project: DistributionProject): RowAction[] {
    return [
      {
        id: "assign",
        label: project.experts.length ? "Изменить экспертов" : "Назначить экспертов",
      },
    ];
  }
  clearExpertSelection(): void {
    const id = this.selected()?.id;
    this.selected.set(null);
    afterNextRender(
      () =>
        Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>("tr[data-expert-id]"))
          .find(row => row.dataset["expertId"] === String(id))
          ?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
  label(row: ExpertRow): string {
    if (row.status === "joined") return "В программе";
    if (row.status === "expired") return "Истекло";
    if (row.status === "revoked") return "Отозвано";
    return "Приглашен";
  }
  deliveryLabel(row: ExpertRow): string {
    if (row.status !== "pending") return "";
    if (row.deliveryStatus === "failed") return "Не удалось отправить письмо";
    if (row.deliveryStatus === "queued") return "Письмо в очереди";
    if (row.deliveryStatus === "sent") return "Письмо отправлено · ждем принятия";
    return "Статус отправки неизвестен";
  }
  initials(row: ExpertRow): string {
    return (row.name || row.email)
      .split(/\s+/)
      .slice(0, 2)
      .map(s => s[0])
      .join("")
      .toUpperCase();
  }
  open(kind: "invite" | "auto" | "quota" | "revoke" | "method"): void {
    this.bulkRevoke.set(false);
    this.dialogError.set(null);
    this.message.set(null);
    this.modal.set(kind);
    this.plan.set(null);
    this.quotaPreview.set(null);
    if (kind === "invite") {
      this.email.reset("");
      this.scopeAll.set(!this.caseNames().length && !this.hasProjectsWithoutCase());
      this.scopeCases.set(new Set());
    }
    if (kind === "quota") this.quota.setValue(this.snapshot()?.requiredEvaluators ?? 1);
    if (kind === "auto") {
      this.casePools.set(
        this.autoGroups().map(g => ({
          caseName: g.name,
          expertIds: [],
        })),
      );
    }
  }
  async close(): Promise<void> {
    if (this.busy()) return;
    if (this.dirty() && !(await this.confirmDiscard()())) return;
    this.modal.set(null);
    this.dialogError.set(null);
  }
  discard(): void {
    this.modal.set(null);
  }
  sendInvite(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.dialogError.set("Введите корректный email эксперта.");
      return;
    }
    if (!this.scopeAll() && !this.scopeCases().size) {
      this.dialogError.set("Выберите хотя бы один кейс или все кейсы.");
      return;
    }
    this.request(
      this.api.invite(this.programId(), this.email.value.trim(), {
        allCases: this.scopeAll(),
        caseNames: this.scopeAll() ? [] : [...this.scopeCases()],
      }),
      () => {
        this.modal.set(null);
        this.message.set("Приглашение создано. Статус отправки письма обновится автоматически.");
        this.load();
      },
    );
  }
  invitationAction(action: "resend" | "revoke"): void {
    if (this.bulkRevoke() && action === "revoke") {
      this.bulkExperts("revoke");
      return;
    }
    const id = this.selected()?.invitationId;
    if (!id) return;
    this.request(this.api.invitationAction(this.programId(), id, action), () => {
      this.modal.set(null);
      this.message.set(
        action === "resend"
          ? "Приглашение передано на повторную отправку."
          : "Приглашение отозвано.",
      );
      this.selected.set(null);
      this.load();
    });
  }
  toggleExpert(id: number | string): void {
    const values = new Set(this.chosenExperts());
    values.has(Number(id)) ? values.delete(Number(id)) : values.add(Number(id));
    this.chosenExperts.set(values);
  }
  previewAllocation(): void {
    if (!this.canPreviewAllocation()) return;
    const pools = this.casePools();
    this.request(
      this.api.allocation(
        this.programId(),
        pools.length
          ? {
              expertIds: [...new Set(pools.flatMap(p => p.expertIds))],
              casePools: pools,
              revision: this.snapshot()!.revision,
            }
          : { expertIds: [...this.chosenExperts()] },
      ),
      plan => this.plan.set(plan),
    );
  }
  applyAllocation(): void {
    const plan = this.plan();
    if (!plan || plan.shortages.length) return;
    this.request(this.api.applyAllocation(this.programId(), plan.planToken), data => {
      this.snapshot.set(data);
      this.modal.set(null);
      this.message.set("Проекты распределены.");
      this.selectedProjects.set(new Set());
    });
  }
  previewQuota(): void {
    if (this.quota.invalid) {
      this.quota.markAsTouched();
      return;
    }
    this.request(this.api.quota(this.programId(), this.quota.value), data =>
      this.quotaPreview.set(data),
    );
  }
  saveQuota(): void {
    const preview = this.quotaPreview();
    if (!preview || preview.requiredEvaluators !== this.quota.value) return;
    this.request(
      this.api.saveQuota(this.programId(), preview.requiredEvaluators, preview.revision),
      data => {
        this.snapshot.set(data);
        this.modal.set(null);
        this.message.set("Число оценщиков изменено, готовность проектов пересчитана.");
      },
    );
  }
  switchTab(tab: "experts" | "distribution"): void {
    if (this.busy()) return;
    this.tab.set(tab);
    this.selected.set(null);
  }
  caseLabel(name: string | null): string {
    return name ?? "Без выбранного кейса";
  }
  distributionCaseKey(name: string | null): string {
    return JSON.stringify(name);
  }
  scopeLabel(expert: ExpertRow): string {
    return (expert.allCases ?? true)
      ? "Все кейсы"
      : expert.caseNames?.length
        ? expert.caseNames.map(n => this.caseLabel(n)).join(", ")
        : "Кейсы не выбраны";
  }
  eligibleFor(expert: ExpertRow, name: string | null): boolean {
    return (
      expert.status === "joined" &&
      ((expert.allCases ?? true) || !!expert.caseNames?.includes(name))
    );
  }
  completed(project: DistributionProject): number {
    return project.experts.filter(e => e.completed).length;
  }
  toggleDistributionProject(project: DistributionProject): void {
    if (this.busy()) return;
    const ids = new Set(this.selectedProjects());
    if (ids.has(project.id)) ids.delete(project.id);
    else {
      ids.add(project.id);
    }
    this.selectedProjects.set(ids);
  }
  selectVisibleProjects(): void {
    if (!this.busy())
      this.selectedProjects.set(
        this.allVisibleSelected() ? new Set() : new Set(this.filteredDistribution().map(p => p.id)),
      );
  }
  openProject(project?: DistributionProject): void {
    if (!project && this.mixedProjectCases()) {
      this.error.set("Для ручного назначения выберите проекты одного кейса.");
      return;
    }
    const ids = project ? [project.id] : [...this.selectedProjects()];
    if (!ids.length) return;
    this.assignmentTargets.set(ids);
    const initial =
      ids.length === 1
        ? this.allProjects()
            .find(p => p.id === ids[0])!
            .experts.map(e => e.expertId)
        : [];
    this.initialExperts.set(initial);
    this.chosenExperts.set(new Set(initial));
    this.expertSearch.reset("");
    this.dialogError.set(null);
    this.modal.set("project");
  }
  private exceedsAssignmentLimit(chosen: Set<number>): boolean {
    const targets = this.targets();
    const limit = this.snapshot()?.requiredEvaluators ?? 1;
    return targets.some(project => {
      const existing = new Set(project.experts.map(e => e.expertId));
      const result = targets.length === 1 ? chosen : new Set([...existing, ...chosen]);
      return result.size > limit && [...result].some(id => !existing.has(id));
    });
  }
  candidateReason(expert: ExpertRow): string | null {
    if (expert.status !== "joined") return "Приглашение еще не принято";
    const id = Number(expert.id);
    if (this.modal() === "project") {
      const targets = this.targets();
      if (targets.length === 1 && targets[0].experts.some(e => e.expertId === id && e.protected))
        return "Оценка сохранена — снять назначение нельзя";
      const additions = targets.filter(p => !p.experts.some(e => e.expertId === id));
      if (additions.some(p => !this.eligibleFor(expert, p.caseName)))
        return "Эксперт другого кейса";
      if (
        expert.userId &&
        additions.some(p => p.leaderId === expert.userId || p.teamUserIds.includes(expert.userId!))
      )
        return "Проект собственной команды";
      if (
        !this.chosenExperts().has(id) &&
        this.exceedsAssignmentLimit(new Set([...this.chosenExperts(), id]))
      )
        return targets.length === 1
          ? "Достигнут лимит экспертов"
          : "У одного из проектов нет свободных мест";
    } else if (this.modal() === "pool" && !this.eligibleFor(expert, this.poolCase()))
      return "Эксперт другого кейса";
    return null;
  }
  toggleCandidate(expert: ExpertRow): void {
    if (!this.busy() && !this.candidateReason(expert)) this.toggleExpert(expert.id);
  }
  saveProjectExperts(): void {
    const state = this.snapshot();
    if (!state || !this.projectDirty() || this.projectLimitExceeded()) return;
    this.request(
      this.api.saveProjectExperts(this.programId(), {
        revision: state.revision,
        projectIds: this.assignmentTargets(),
        expertIds: [...this.chosenExperts()],
        mode: this.assignmentTargets().length === 1 ? "replace" : "add",
      }),
      data => {
        this.snapshot.set(data);
        this.modal.set(null);
        this.selectedProjects.set(new Set());
        this.message.set("Эксперты назначены.");
      },
    );
  }
  openScope(expert: ExpertRow): void {
    this.bulkScope.set(false);
    this.selected.set(expert);
    this.scopeAll.set(expert.allCases ?? true);
    this.scopeCases.set(new Set(expert.caseNames ?? []));
    this.dialogError.set(null);
    this.modal.set("scope");
  }
  toggleScope(name: string | null): void {
    const values = this.scopeAll()
      ? new Set<string | null>([
          ...this.caseNames(),
          ...(this.hasProjectsWithoutCase() ? [null] : []),
        ])
      : new Set(this.scopeCases());
    values.has(name) ? values.delete(name) : values.add(name);
    this.scopeCases.set(values);
    this.scopeAll.set(false);
  }
  saveScope(): void {
    if (this.bulkScope()) {
      this.bulkExperts("cases");
      return;
    }
    const state = this.snapshot(),
      expert = this.selected();
    if (!state || !expert) return;
    const data = {
      revision: state.revision,
      allCases: this.scopeAll(),
      caseNames: this.scopeAll() ? [] : [...this.scopeCases()],
    };
    this.request(
      expert.status === "joined"
        ? this.api.saveCaseScope(this.programId(), Number(expert.id), data)
        : this.api.saveInvitationCaseScope(this.programId(), expert.invitationId!, data),
      data => {
        this.snapshot.set(data);
        this.selected.set(data.experts.find(e => e.id === expert.id) ?? null);
        this.modal.set(null);
        this.message.set("Кейсы эксперта сохранены. Текущие назначения остаются.");
      },
    );
  }
  poolExperts(name: string | null): ExpertRow[] {
    const ids = this.casePools().find(p => p.caseName === name)?.expertIds ?? [];
    return this.joined().filter(e => ids.includes(Number(e.id)));
  }
  poolNames(name: string | null): string {
    return (
      this.poolExperts(name)
        .map(e => e.name || e.email)
        .join(" · ") || "Эксперты не выбраны"
    );
  }
  openPool(name: string | null): void {
    if (this.busy()) return;
    this.poolCase.set(name);
    this.chosenExperts.set(
      new Set(this.casePools().find(p => p.caseName === name)?.expertIds ?? []),
    );
    this.expertSearch.reset("");
    this.dialogError.set(null);
    this.modal.set("pool");
  }
  savePool(): void {
    this.casePools.update(pools =>
      pools.map(p =>
        p.caseName === this.poolCase() ? { ...p, expertIds: [...this.chosenExperts()] } : p,
      ),
    );
    this.plan.set(null);
    this.modal.set("auto");
  }
}
