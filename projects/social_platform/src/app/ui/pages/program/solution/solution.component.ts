/** @format */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Injector,
  signal,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { combineLatest, EMPTY, finalize, map, startWith, Subject, switchMap } from "rxjs";
import {
  GetSolutionContextUseCase,
  CreateSolutionUseCase,
  GetSolutionUseCase,
} from "@api/solution/use-cases/solution.use-cases";
import { solutionApplicationRoute } from "@api/solution/solution-navigation";
import { AppRoutes } from "@api/paths/app-routes";
import {
  ProgramSolution,
  SolutionApiError,
  SolutionIssue,
} from "@domain/solution/solution-contract.model";
import { validSolutionId } from "@domain/solution/ports/solution.repository.port";
import { ButtonDirective, FieldDirective } from "@uilib";
import { DatePipe } from "@angular/common";
import { SolutionTeamComponent } from "./solution-team.component";
import { SolutionDraftFacade } from "@api/solution/facades/solution-draft.facade";
import { SolutionFieldsComponent } from "@ui/widgets/solution-fields/solution-fields.component";
import { ProjectInviteDialogComponent } from "@ui/widgets/project-invite/project-invite-dialog.component";

@Component({
  selector: "app-program-solution",
  standalone: true,
  imports: [
    RouterLink,
    ButtonDirective,
    FieldDirective,
    ReactiveFormsModule,
    DatePipe,
    SolutionTeamComponent,
    SolutionFieldsComponent,
    ProjectInviteDialogComponent,
  ],
  providers: [SolutionDraftFacade],
  templateUrl: "./solution.component.html",
  styleUrl: "./solution.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramSolutionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly context = inject(GetSolutionContextUseCase);
  private readonly create = inject(CreateSolutionUseCase);
  private readonly get = inject(GetSolutionUseCase);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  readonly draft = inject(SolutionDraftFacade);
  readonly solution = signal<ProgramSolution | null>(null);
  readonly loading = signal(true);
  readonly error = signal<SolutionApiError | null>(null);
  readonly teamTab = signal(false);
  readonly programId = signal(0);
  readonly refreshingTeam = signal(false);
  readonly teamRefreshError = signal("");
  readonly routes = AppRoutes;
  readonly submissionAttempted = signal(false);
  readonly submissionIssues = signal<SolutionIssue[]>([]);
  readonly confirmation = signal<ProgramSolution | null>(null);
  readonly commandBusy = computed(() => this.draft.busy() || this.confirmation() !== null);
  submissionTrigger: HTMLElement | null = null;
  private readonly retry = new Subject<void>();
  private readonly teamRefresh = new Subject<{ programId: number; solutionId: number } | null>();
  private reconcileDraft = false;

  canLeave(): boolean {
    return (
      !(this.draft.dirty() || this.commandBusy()) ||
      confirm("В заявке есть несохраненные изменения. Покинуть страницу?")
    );
  }

  @HostListener("window:beforeunload", ["$event"])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.draft.dirty() || this.commandBusy()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  saveDraft(): void {
    if (this.commandBusy() || this.refreshingTeam() || this.teamRefreshError()) return;
    this.draft.save().subscribe(result => {
      if (result.ok) this.solution.set(result.value);
      else this.handleCommandError(result.error);
    });
  }

  prepareSubmission(event: Event): void {
    if (
      this.commandBusy() ||
      this.refreshingTeam() ||
      this.teamRefreshError() ||
      !this.solution()?.permissions.canSubmit
    )
      return;
    this.submissionTrigger = event.currentTarget as HTMLElement;
    this.submissionAttempted.set(true);
    this.submissionIssues.set([]);
    this.draft.save().subscribe(result => {
      if (!result.ok) {
        this.handleCommandError(result.error);
        return;
      }
      const saved = result.value;
      this.solution.set(saved);
      if (!saved.permissions.canSubmit) {
        this.draft.error.set({
          code: "submission_closed",
          detail: "Сдача сейчас недоступна. Черновик сохранен.",
          errors: [],
          meta: {},
        });
        return;
      }
      const issues = saved.readiness?.issues ?? [];
      if (issues.length) {
        this.submissionIssues.set(issues);
        this.draft.showIssues(issues);
        void this.focusIssue(issues[0]);
      } else this.confirmation.set(saved);
    });
  }

  confirmSubmission(): void {
    const checkpoint = this.confirmation();
    if (!checkpoint || this.draft.busy()) return;
    this.draft.submit(checkpoint).subscribe(result => {
      this.confirmation.set(null);
      if (result.ok) {
        this.solution.set(result.value);
        this.submissionIssues.set([]);
        this.submissionAttempted.set(false);
        this.refreshTeam();
      } else {
        this.handleCommandError(result.error);
        // A network interruption has an unknown outcome: GET determines the actual state.
        if (
          [
            "network",
            "server_error",
            "unknown",
            "already_submitted",
            "submission_closed",
            "not_competitive",
          ].includes(result.error.code)
        )
          this.refreshTeam();
      }
    });
  }

  private handleCommandError(error: SolutionApiError): void {
    this.submissionIssues.set(error.errors);
    if (error.errors.length) void this.focusIssue(error.errors[0]);
    else if (this.draft.name.invalid)
      void this.focusIssue({
        path: "name",
        code: "invalid",
        detail: "Проверьте название",
        fieldId: null,
      });
    else {
      const field = this.solution()?.form.fields.find(
        field => this.draft.group().get(String(field.id))?.invalid,
      );
      if (field)
        void this.focusIssue({
          path: "answers",
          code: "invalid",
          detail: "Проверьте значение",
          fieldId: field.id,
        });
    }
    if (
      [
        "version_conflict",
        "form_revision_conflict",
        "not_solution_captain",
        "team_frozen",
        "solution_mode_unavailable",
      ].includes(error.code)
    ) {
      this.reconcileDraft = true;
      this.refreshTeam();
    } else if (
      [
        "not_found",
        "forbidden",
        "permission_denied",
        "unauthorized",
        "authentication_required",
      ].includes(error.code)
    ) {
      this.draft.clear();
      this.solution.set(null);
      this.showError(error);
    }
  }

  async focusIssue(issue: SolutionIssue): Promise<void> {
    const key = this.solution()?.programId + ":" + this.solution()?.id;
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: issue.path.startsWith("team") ? { tab: "team" } : {},
    });
    afterNextRender(
      () => {
        if (this.solution()?.programId + ":" + this.solution()?.id !== key) return;
        const selector = issue.path.startsWith("team")
          ? "#team-title"
          : issue.fieldId !== null
            ? `#solution-field-${issue.fieldId}`
            : issue.path === "name"
              ? "#solution-name"
              : "#data-title";
        let target = this.element.nativeElement.querySelector<HTMLElement>(selector);
        if (target?.matches('input[type="file"]'))
          target = target.closest("fieldset")?.querySelector<HTMLElement>("button") ?? null;
        if (target) {
          if (!target.matches("input,select,textarea,button,a")) target.tabIndex = -1;
          target.focus();
          target.scrollIntoView?.({ block: "center", behavior: "smooth" });
        }
      },
      { injector: this.injector },
    );
  }

  issueLabel(issue: SolutionIssue): string {
    const label =
      issue.fieldId === null
        ? issue.path.startsWith("team")
          ? "Команда"
          : "Заявка"
        : this.solution()?.form.fields.find(field => field.id === issue.fieldId)?.label;
    return label ? label + ": " + issue.detail : issue.detail;
  }

  discardDraft(): void {
    if (!this.commandBusy() && confirm("Отменить несохраненные изменения решения?"))
      this.draft.discard();
  }

  reload(): void {
    this.retry.next();
  }

  refreshTeam(): void {
    const solution = this.solution();
    if (solution) this.teamRefresh.next({ programId: solution.programId, solutionId: solution.id });
  }

  teamLeft(): void {
    void this.router.navigate([AppRoutes.program.detail(this.programId())]);
  }

  constructor() {
    this.teamRefresh
      .pipe(
        switchMap(context => {
          if (!context) return EMPTY;
          this.refreshingTeam.set(true);
          this.teamRefreshError.set("");
          return this.get.execute(context.programId, context.solutionId).pipe(
            map(result => ({ context, result })),
            finalize(() => this.refreshingTeam.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ context, result }) => {
        if (this.programId() !== context.programId || this.solution()?.id !== context.solutionId)
          return;
        if (result.ok) {
          if (this.draft.hydrate(result.value)) this.solution.set(result.value);
          if (this.reconcileDraft) {
            this.reconcileDraft = false;
            this.draft.reconciled();
          }
          return;
        }
        if (
          [
            "not_found",
            "forbidden",
            "permission_denied",
            "unauthorized",
            "authentication_required",
          ].includes(result.error.code)
        ) {
          this.draft.clear();
          this.solution.set(null);
          this.showError(result.error);
        } else this.teamRefreshError.set(result.error.detail);
      });
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => this.teamTab.set(params.get("tab") === "team"));
    combineLatest([
      combineLatest(this.route.pathFromRoot.map(route => route.paramMap)),
      this.retry.pipe(startWith(undefined)),
    ])
      .pipe(
        map(([params]) => ({
          programId: Number(params.find(p => p.has("programId"))?.get("programId")),
          solutionId: params.find(p => p.has("solutionId"))?.get("solutionId"),
        })),
        switchMap(({ programId, solutionId }) => {
          this.teamRefresh.next(null);
          this.refreshingTeam.set(false);
          this.teamRefreshError.set("");
          this.reconcileDraft = false;
          this.confirmation.set(null);
          this.submissionIssues.set([]);
          this.submissionAttempted.set(false);
          this.draft.clear();
          this.solution.set(null);
          this.error.set(null);
          this.loading.set(true);
          this.programId.set(programId);
          if (
            !validSolutionId(programId) ||
            (solutionId !== undefined && !validSolutionId(Number(solutionId)))
          ) {
            this.showError({
              code: "not_found",
              detail: "Заявка не найдена.",
              errors: [],
              meta: {},
            });
            return EMPTY;
          }
          if (solutionId !== undefined) return this.get.execute(programId, Number(solutionId));
          return this.context.execute(programId).pipe(
            switchMap(result => {
              if (!result.ok) {
                this.showError(result.error);
                return EMPTY;
              }
              const context = result.value;
              if (context.currentApplication) {
                const destination = solutionApplicationRoute(context.currentApplication);
                void this.router.navigate([destination.path], {
                  queryParams: destination.queryParams,
                  replaceUrl: true,
                });
              } else if (context.storageMode === "legacy_project") {
                void this.router.navigate([AppRoutes.program.detail(programId)], {
                  replaceUrl: true,
                });
              } else if (context.canCreate) {
                return this.create.execute(programId);
              } else {
                this.showError({
                  code: context.blockedReason ?? "forbidden",
                  detail:
                    "Создание заявки сейчас недоступно. Проверьте регистрацию и сроки программы.",
                  errors: [],
                  meta: {},
                });
              }
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        this.loading.set(false);
        if (!result.ok) {
          this.showError(result.error);
          return;
        }
        this.solution.set(result.value);
        this.draft.hydrate(result.value);
        if (!this.route.snapshot.paramMap.has("solutionId")) {
          void this.router.navigate(
            [AppRoutes.program.solution(this.programId(), result.value.id)],
            { replaceUrl: true },
          );
        }
      });
  }

  private showError(error: SolutionApiError): void {
    this.error.set(error);
    this.loading.set(false);
  }
}
