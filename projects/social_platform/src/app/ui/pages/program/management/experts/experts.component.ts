/** @format */
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
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, finalize } from "rxjs";
import {
  AlertDirective,
  AvatarComponent,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
} from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import {
  AllocationPlan,
  AssignmentOptions,
  AssignmentProject,
  ExpertRow,
  ExpertWorkspace,
  QuotaPreview,
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly snapshot = signal<ExpertWorkspace | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly selected = signal<ExpertRow | null>(null);
  readonly modal = signal<"invite" | "manual" | "assignments" | "auto" | "quota" | "revoke" | null>(
    null,
  );
  readonly plan = signal<AllocationPlan | null>(null);
  readonly quotaPreview = signal<QuotaPreview | null>(null);
  readonly options = signal<AssignmentOptions | null>(null);
  readonly chosenProjects = signal(new Set<number>());
  readonly chosenExperts = signal(new Set<number>());
  readonly search = this.fb.control("");
  readonly status = this.fb.control("all");
  readonly projectSearch = this.fb.control("");
  readonly caseFilter = this.fb.control("all");
  readonly email = this.fb.control("", [
    Validators.required,
    Validators.email,
    Validators.maxLength(254),
  ]);
  readonly quota = this.fb.control(1, [
    Validators.required,
    Validators.min(1),
    Validators.max(1000),
    Validators.pattern(/^\d+$/),
  ]);
  private readonly query = signal("");
  private readonly statusValue = signal("all");
  private readonly projectQuery = signal("");
  private readonly caseValue = signal("all");
  readonly page = signal(0);
  readonly pageSize = 20;
  readonly href = presentationHref;
  readonly joined = computed(
    () => this.snapshot()?.experts.filter(e => e.status === "joined") ?? [],
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
  readonly cases = computed(() => [
    ...new Set(
      this.options()
        ?.projects.map(p => p.caseName)
        .filter((v): v is string => !!v),
    ),
  ]);
  readonly visibleProjects = computed(() =>
    (this.options()?.projects ?? []).filter(
      p =>
        (this.modal() !== "assignments" || p.assigned) &&
        p.name
          .toLocaleLowerCase("ru")
          .includes(this.projectQuery().trim().toLocaleLowerCase("ru")) &&
        (this.caseValue() === "all" ||
          (this.caseValue() === "none" ? !p.caseName : `case:${p.caseName}` === this.caseValue())),
    ),
  );
  readonly manualDirty = computed(
    () =>
      !!this.options() &&
      this.modal() === "manual" &&
      this.options()!.projects.some(p => p.assigned !== this.chosenProjects().has(p.id)),
  );
  readonly dirty = computed(() => this.manualDirty());
  readonly dialogTitle = computed(() =>
    this.modal() === "invite"
      ? "Пригласить эксперта"
      : this.modal() === "quota"
        ? "Число оценщиков на проект"
        : this.modal() === "manual"
          ? "Назначить проекты"
          : this.modal() === "assignments"
            ? "Назначения эксперта"
            : this.modal() === "revoke"
              ? "Отозвать приглашение"
              : this.plan()
                ? this.plan()!.shortages.length
                  ? "Не хватает экспертов"
                  : "План распределения"
                : "Распределить проекты",
  );
  private loadSequence = 0;
  constructor() {
    effect(() => {
      const id = this.programId();
      untracked(() => {
        this.snapshot.set(null);
        this.selected.set(null);
        this.load(id);
      });
    });
    effect(() => this.statusChange.emit({ dirty: this.dirty(), busy: this.busy() }));
    this.search.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.query.set(v);
      this.page.set(0);
      this.selected.set(null);
    });
    this.status.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => {
      this.statusValue.set(v);
      this.page.set(0);
      this.selected.set(null);
    });
    this.projectSearch.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(v => this.projectQuery.set(v));
    this.caseFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => this.caseValue.set(v));
    this.quota.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.quotaPreview.set(null));
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
  label(row: ExpertRow): string {
    if (row.status === "joined") return "В программе";
    if (row.status === "expired") return "Истекло";
    if (row.status === "revoked") return "Отозвано";
    return row.deliveryStatus === "failed"
      ? "Не доставлено"
      : row.deliveryStatus === "queued"
        ? "Отправляется"
        : "Приглашён";
  }
  initials(row: ExpertRow): string {
    return (row.name || row.email)
      .split(/\s+/)
      .slice(0, 2)
      .map(s => s[0])
      .join("")
      .toUpperCase();
  }
  open(kind: "invite" | "auto" | "quota" | "revoke"): void {
    this.dialogError.set(null);
    this.message.set(null);
    this.modal.set(kind);
    this.plan.set(null);
    this.quotaPreview.set(null);
    if (kind === "invite") this.email.reset("");
    if (kind === "quota") this.quota.setValue(this.snapshot()?.requiredEvaluators ?? 1);
    if (kind === "auto") this.chosenExperts.set(new Set(this.joined().map(e => Number(e.id))));
  }
  async close(): Promise<void> {
    if (this.busy()) return;
    if (this.dirty() && !(await this.confirmDiscard()())) return;
    this.modal.set(null);
    this.options.set(null);
    this.dialogError.set(null);
  }
  discard(): void {
    this.modal.set(null);
    this.options.set(null);
  }
  sendInvite(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.dialogError.set("Введите корректный email эксперта.");
      return;
    }
    this.request(this.api.invite(this.programId(), this.email.value.trim()), () => {
      this.modal.set(null);
      this.message.set("Приглашение передано на отправку. Статус доставки появится в списке.");
      this.load();
    });
  }
  invitationAction(action: "resend" | "revoke"): void {
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
  openAssignments(readonly = false): void {
    const expert = this.selected();
    if (!expert || expert.status !== "joined") return;
    this.options.set(null);
    this.projectSearch.reset("");
    this.caseFilter.reset("all");
    this.modal.set(readonly ? "assignments" : "manual");
    this.request(this.api.assignments(this.programId(), Number(expert.id)), data => {
      this.options.set(data);
      this.chosenProjects.set(new Set(data.projects.filter(p => p.assigned).map(p => p.id)));
    });
  }
  toggleProject(project: AssignmentProject): void {
    if (
      this.busy() ||
      project.protected ||
      (!project.assigned && (!project.submitted || project.ownTeam))
    )
      return;
    const values = new Set(this.chosenProjects());
    values.has(project.id) ? values.delete(project.id) : values.add(project.id);
    this.chosenProjects.set(values);
  }
  saveAssignments(): void {
    const expert = this.selected(),
      options = this.options();
    if (!expert || !options) return;
    this.request(
      this.api.saveAssignments(this.programId(), Number(expert.id), options.revision, [
        ...this.chosenProjects(),
      ]),
      () => {
        this.modal.set(null);
        this.options.set(null);
        this.message.set("Назначения сохранены.");
        this.load();
      },
    );
  }
  toggleExpert(id: number | string): void {
    const values = new Set(this.chosenExperts());
    values.has(Number(id)) ? values.delete(Number(id)) : values.add(Number(id));
    this.chosenExperts.set(values);
  }
  previewAllocation(): void {
    this.request(
      this.api.allocation(this.programId(), { expertIds: [...this.chosenExperts()] }),
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
}
