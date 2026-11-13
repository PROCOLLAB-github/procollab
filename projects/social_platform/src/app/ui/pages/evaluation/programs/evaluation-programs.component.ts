/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from "rxjs";
import {
  AlertDirective,
  AvatarComponent,
  ButtonDirective,
  CardDirective,
  DialogBodyDirective,
  DialogFooterDirective,
  DialogHeaderComponent,
  FieldDirective,
  IconComponent,
  PaginationComponent,
  StateComponent,
  TabsComponent,
} from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { EvaluationProgram, EvaluationPrograms } from "@domain/program/evaluation-workspace.model";
import { GetCabinetApplicationsUseCase } from "@api/solution/use-cases/solution-evaluation.use-cases";
import {
  SolutionApplicationRef,
  SolutionCabinetApplication,
  SolutionCabinetApplications,
} from "@domain/solution/solution-contract.model";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { evaluationError } from "@utils/evaluation-workspace";
import { presentationHref } from "@utils/program-case-analytics";
import { EvaluationNavigationService } from "@api/program/evaluation-navigation.service";
import { GetProgramFiltersUseCase } from "@api/program/use-cases/get-program-filters.use-case";
import { ExportFileService } from "@api/export-file/export-file.service";
import { saveFile } from "@utils/export-file";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";

type CabinetTab = "pending" | "completed" | "invitations";
type CabinetData = EvaluationPrograms & { applications: SolutionCabinetApplications };
const positive = (value: string | null) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

@Component({
  selector: "app-evaluation-programs",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    AlertDirective,
    AvatarComponent,
    ButtonDirective,
    CardDirective,
    DialogBodyDirective,
    DialogFooterDirective,
    DialogHeaderComponent,
    FieldDirective,
    IconComponent,
    ModalComponent,
    PaginationComponent,
    StateComponent,
    TabsComponent,
    TransientNoticeComponent,
  ],
  templateUrl: "./evaluation-programs.component.html",
  styleUrl: "./evaluation-programs.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationProgramsComponent {
  readonly navigation = inject(EvaluationNavigationService);
  private readonly api = inject(EvaluationUseCase);
  private readonly applications = inject(GetCabinetApplicationsUseCase);
  private readonly getFilters = inject(GetProgramFiltersUseCase);
  private readonly exports = inject(ExportFileService);
  private readonly profile = inject(ProfileInfoService);
  private readonly auth = inject(AuthInfoService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly accountId = computed(() => this.profile.profile()?.id);
  private readonly snapshot = signal<{ accountId: number; data: CabinetData } | null>(null);
  private readonly revision = signal(0);
  private handledInvitation: string | null = null;
  readonly data = computed(() =>
    this.snapshot()?.accountId === this.accountId() ? (this.snapshot()?.data ?? null) : null,
  );
  readonly tab = computed<CabinetTab>(() => {
    const tab = this.params().get("tab");
    return tab === "completed" || tab === "invitations" ? tab : "pending";
  });
  readonly selectedProgramId = computed(() => positive(this.params().get("program")));
  readonly activeFilters = computed(
    () =>
      Object.fromEntries(
        this.params()
          .keys.filter(key => key.startsWith("filter."))
          .map(key => [key.slice("filter.".length), this.params().getAll(key).filter(Boolean)])
          .filter(([, values]) => values.length),
      ) as Record<string, string[]>,
  );
  readonly query = computed(
    () => ({
      status: this.tab() === "completed" ? ("completed" as const) : ("pending" as const),
      q: (this.params().get("q") ?? "").trim().slice(0, 200),
      programId: this.selectedProgramId(),
      ...(this.selectedProgramId() && Object.keys(this.activeFilters()).length
        ? { filters: JSON.stringify(this.activeFilters()) }
        : {}),
      limit: 20,
      offset: ((positive(this.params().get("page")) ?? 1) - 1) * 20,
    }),
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );
  readonly search = new FormControl("", { nonNullable: true });
  readonly program = new FormControl("", { nonNullable: true });
  readonly filtersOpen = signal(false);
  readonly fields = signal<PartnerProgramFields[]>([]);
  readonly filterError = signal(false);
  readonly draftFilters = signal<Record<string, string[]>>({});
  readonly tooManyFilters = computed(
    () => Object.values(this.draftFilters()).filter(values => values.length).length > 3,
  );
  readonly exporting = signal(false);
  readonly exportError = signal(false);
  readonly selected = signal<EvaluationProgram | null>(null);
  readonly loading = signal(true);
  readonly failed = signal<string | null>(null);
  readonly unauthorized = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly accepted = signal(false, { equal: () => false });
  readonly paths = AppRoutes;
  readonly href = presentationHref;
  readonly programs = computed(() => this.data()?.results.filter(p => p.status === "joined") ?? []);
  readonly selectedProgram = computed(() =>
    this.programs().find(program => program.id === this.selectedProgramId()),
  );
  readonly filtersProgramId = computed(() => {
    const program = this.selectedProgram();
    return program?.storageMode !== "solution" ? program?.id : undefined;
  });
  readonly invitations = computed(
    () => this.data()?.results.filter(p => p.status === "pending") ?? [],
  );
  readonly tabs = computed(() => [
    {
      id: "pending",
      linkText: `Осталось оценить · ${(this.selectedProgramId() ? this.selectedProgram()?.remaining : this.data()?.applications.pending) ?? "—"}`,
    },
    {
      id: "completed",
      linkText: `Оцененные · ${(this.selectedProgramId() ? this.selectedProgram()?.completed : this.data()?.applications.completed) ?? "—"}`,
    },
    { id: "invitations", linkText: `Приглашения · ${this.invitations().length}` },
  ]);
  readonly filtered = computed(() => !!this.query().q || !!this.query().filters);
  readonly rangeStart = computed(() =>
    this.data()?.applications.results.length ? this.query().offset + 1 : 0,
  );
  readonly rangeEnd = computed(() => {
    const page = this.data()?.applications;
    return page?.results.length
      ? Math.min(this.query().offset + page.results.length, page.count)
      : 0;
  });
  readonly groups = computed(() => {
    const programs = new Map(this.programs().map(p => [p.id, p]));
    const groups = new Map<
      number,
      { program: EvaluationProgram; applications: SolutionCabinetApplication[] }
    >();
    for (const row of this.data()?.applications.results ?? []) {
      const program = programs.get(row.application.programId);
      if (!program) continue;
      if (!groups.has(program.id)) groups.set(program.id, { program, applications: [] });
      groups.get(program.id)!.applications.push(row);
    }
    return [...groups.values()];
  });
  readonly allCompleted = computed(() => {
    const p = this.data()?.applications;
    const program = this.selectedProgram();
    if (this.selectedProgramId()) return !!program?.completed && !program.remaining;
    return !!p && !p.pending && !!p.completed && !p.unavailable;
  });

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(q => this.navigate({ q: q.trim() || null, page: null }));
    this.program.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(program =>
        this.navigate({ ...this.clearFieldFilters(), program: program || null, page: null }),
      );
    effect(onCleanup => {
      const programId = this.filtersProgramId();
      this.filtersOpen.set(false);
      this.fields.set([]);
      this.filterError.set(false);
      this.exportError.set(false);
      if (!programId) return;
      const request = this.getFilters.execute(programId).subscribe(result => {
        this.filterError.set(!result.ok);
        this.fields.set(
          result.ok
            ? result.value.filter(field =>
                ["select", "radio", "checkbox"].includes(field.fieldType),
              )
            : [],
        );
      });
      onCleanup(() => request.unsubscribe());
    });
    effect(() => {
      const q = this.query();
      untracked(() => {
        this.search.setValue(q.q, { emitEvent: false });
        this.program.setValue(q.programId?.toString() ?? "", { emitEvent: false });
      });
    });
    effect(() => {
      this.accountId();
      untracked(() => {
        this.selected.set(null);
        this.busy.set(false);
        this.error.set(null);
        this.accepted.set(false);
        this.handledInvitation = null;
      });
    });
    effect(onCleanup => {
      const accountId = this.accountId();
      const query = this.query();
      this.revision();
      this.failed.set(null);
      this.unauthorized.set(false);
      if (!accountId) {
        this.snapshot.set(null);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      const request = forkJoin({
        programs: this.api.programs(),
        applications: this.applications.execute(query),
      }).subscribe({
        next: ({ programs, applications }) => {
          if (!applications.ok) {
            this.snapshot.set(null);
            this.failed.set(applications.error.detail);
            this.unauthorized.set(
              ["unauthorized", "authentication_required"].includes(applications.error.code),
            );
          } else if (
            !Array.isArray(programs.results) ||
            !Array.isArray(applications.value?.results)
          ) {
            this.snapshot.set(null);
            this.failed.set("Кабинет временно недоступен. Попробуйте обновить страницу.");
          } else {
            this.snapshot.set({
              accountId,
              data: { ...programs, applications: applications.value },
            });
            this.navigation.restore(this.router.url);
          }
          this.loading.set(false);
        },
        error: e => {
          this.snapshot.set(null);
          this.unauthorized.set(e?.status === 401);
          this.failed.set(evaluationError(e));
          this.loading.set(false);
        },
      });
      onCleanup(() => request.unsubscribe());
    });
    effect(() => {
      const id = positive(this.params().get("invitation"));
      const key = `${this.accountId()}:${id}`;
      if (!id || key === this.handledInvitation) return;
      const invitation = this.invitations().find(p => p.invitationId === id);
      if (invitation)
        untracked(() => {
          this.handledInvitation = key;
          this.open(invitation);
        });
    });
  }
  reload(): void {
    this.revision.update(n => n + 1);
  }
  navigate(queryParams: Record<string, string | string[] | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
    });
  }
  setTab(tab: string): void {
    if (tab === "pending" || tab === "completed" || tab === "invitations") {
      this.navigate({ tab: tab === "pending" ? null : tab, page: null });
    }
  }
  resetFilters(): void {
    this.navigate({ ...this.clearFieldFilters(), q: null, page: null });
  }
  private clearFieldFilters() {
    return Object.fromEntries(
      this.params()
        .keys.filter(key => key.startsWith("filter."))
        .map(key => [key, null]),
    );
  }
  openFilters(): void {
    this.draftFilters.set(this.activeFilters());
    this.filtersOpen.set(true);
  }
  setFieldFilter(name: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.draftFilters.update(filters => ({ ...filters, [name]: value ? [value] : [] }));
  }
  applyFilters(): void {
    if (this.tooManyFilters()) return;
    const filters = Object.entries(this.draftFilters()).filter(([, values]) => values.length);
    this.filtersOpen.set(false);
    this.navigate({
      ...this.clearFieldFilters(),
      ...Object.fromEntries(filters.map(([name, values]) => [`filter.${name}`, values])),
      page: null,
    });
  }
  exportRates(): void {
    const program = this.selectedProgram();
    if (!program?.canExportRates || this.exporting()) return;
    this.exportError.set(false);
    this.exporting.set(true);
    this.exports
      .exportProgramRates(program.id)
      .pipe(
        finalize(() => this.exporting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: blob => saveFile(blob, "rates", program.name),
        error: () => this.exportError.set(true),
      });
  }
  page(delta: number): void {
    this.navigate({ page: Math.max(1, this.query().offset / 20 + 1 + delta) });
  }
  evaluationPath(application: SolutionApplicationRef): string {
    return application.kind === "solution"
      ? `/office/program/${application.programId}/solutions/${application.solutionId}/evaluation`
      : AppRoutes.office.projectEvaluation(application.programId, application.projectId);
  }
  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join("")
      .toUpperCase();
  }
  open(program: EvaluationProgram): void {
    this.selected.set(program);
    this.error.set(null);
  }
  close(): void {
    if (this.busy()) return;
    this.selected.set(null);
    this.navigate({ invitation: null });
  }
  accept(): void {
    const id = this.selected()?.invitationId;
    const accountId = this.accountId();
    if (!id || !accountId || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.api
      .acceptOwn(id)
      .pipe(
        finalize(() => {
          if (accountId === this.accountId()) this.busy.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (accountId !== this.accountId()) return;
          this.selected.set(null);
          this.accepted.set(true);
          this.navigate({ invitation: null });
          this.reload();
          this.auth
            .fetchProfile()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: profile => {
                if (accountId === this.accountId()) this.profile.applyProfileUpdated(profile);
              },
              error: () => {
                if (accountId === this.accountId()) this.profile.invalidateProfile();
              },
            });
        },
        error: e => {
          if (accountId === this.accountId()) this.error.set(evaluationError(e));
        },
      });
  }
}
