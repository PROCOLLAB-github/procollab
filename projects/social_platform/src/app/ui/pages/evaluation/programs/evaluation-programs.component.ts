/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, finalize } from "rxjs";
import { AlertDirective, AvatarComponent, ButtonDirective, FieldDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import {
  EvaluationProgram,
  ExpertCabinet,
  ExpertCabinetProject,
} from "@domain/program/evaluation-workspace.model";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { evaluationError } from "@utils/evaluation-workspace";
import { presentationHref } from "@utils/program-case-analytics";
import { EvaluationNavigationService } from "@api/program/evaluation-navigation.service";

type CabinetTab = "pending" | "completed" | "invitations";
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
    FieldDirective,
    ModalComponent,
    TransientNoticeComponent,
  ],
  templateUrl: "./evaluation-programs.component.html",
  styleUrl: "./evaluation-programs.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationProgramsComponent {
  readonly navigation = inject(EvaluationNavigationService);
  private readonly api = inject(EvaluationUseCase);
  private readonly profile = inject(ProfileInfoService);
  private readonly auth = inject(AuthInfoService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly accountId = computed(() => this.profile.profile()?.id);
  private readonly snapshot = signal<{ accountId: number; data: ExpertCabinet } | null>(null);
  private readonly revision = signal(0);
  private handledInvitation: string | null = null;
  readonly data = computed(() =>
    this.snapshot()?.accountId === this.accountId() ? (this.snapshot()?.data ?? null) : null,
  );
  readonly tab = computed<CabinetTab>(() => {
    const tab = this.params().get("tab");
    return tab === "completed" || tab === "invitations" ? tab : "pending";
  });
  readonly query = computed(
    () => ({
      status: this.tab() === "completed" ? ("completed" as const) : ("pending" as const),
      q: (this.params().get("q") ?? "").trim().slice(0, 200),
      programId: positive(this.params().get("program")),
      limit: 20,
      offset: ((positive(this.params().get("page")) ?? 1) - 1) * 20,
    }),
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );
  readonly search = new FormControl("", { nonNullable: true });
  readonly program = new FormControl("", { nonNullable: true });
  readonly searchExpanded = signal(false);
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>("searchInput");
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
  readonly invitations = computed(
    () => this.data()?.results.filter(p => p.status === "pending") ?? [],
  );
  readonly filtered = computed(() => !!this.query().q || !!this.query().programId);
  readonly rangeStart = computed(() => (this.data()?.projects.count ? this.query().offset + 1 : 0));
  readonly rangeEnd = computed(() =>
    Math.min(this.query().offset + 20, this.data()?.projects.count ?? 0),
  );
  readonly groups = computed(() => {
    const programs = new Map(this.programs().map(p => [p.id, p]));
    const groups = new Map<
      number,
      { program: EvaluationProgram; projects: ExpertCabinetProject[] }
    >();
    for (const project of this.data()?.projects.results ?? []) {
      const program = programs.get(project.programId);
      if (!program) continue;
      if (!groups.has(program.id)) groups.set(program.id, { program, projects: [] });
      groups.get(program.id)!.projects.push(project);
    }
    return [...groups.values()];
  });
  readonly allCompleted = computed(() => {
    const p = this.data()?.projects;
    return !!p && !p.pending && !!p.completed && !p.unavailable;
  });

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(q => this.navigate({ q: q.trim() || null, page: null }));
    this.program.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(program => this.navigate({ program: program || null, page: null }));
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
      const request = this.api.cabinet(query).subscribe({
        next: data => {
          if (!data.projects || !Array.isArray(data.projects.results)) {
            this.snapshot.set(null);
            this.failed.set("Кабинет временно недоступен. Попробуйте обновить страницу.");
          } else {
            this.snapshot.set({ accountId, data });
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
    effect(() => {
      if (this.searchExpanded()) this.searchInput()?.nativeElement.focus();
    });
  }
  reload(): void {
    this.revision.update(n => n + 1);
  }
  navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
    });
  }
  setTab(tab: CabinetTab): void {
    this.navigate({ tab: tab === "pending" ? null : tab, page: null });
  }
  resetFilters(): void {
    this.navigate({ q: null, program: null, page: null });
  }
  page(delta: number): void {
    this.navigate({ page: Math.max(1, this.query().offset / 20 + 1 + delta) });
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
