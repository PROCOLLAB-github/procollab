/** @format */

import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
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
import { ProgramSolution, SolutionApiError } from "@domain/solution/solution-contract.model";
import { validSolutionId } from "@domain/solution/ports/solution.repository.port";
import { ButtonDirective } from "@uilib";
import { DatePipe } from "@angular/common";
import { SolutionTeamComponent } from "./solution-team.component";

/** FE01: read surface and route foundation. Editing/team commands follow in FE03–FE06. */
@Component({
  selector: "app-program-solution",
  standalone: true,
  imports: [RouterLink, ButtonDirective, DatePipe, SolutionTeamComponent],
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
  readonly solution = signal<ProgramSolution | null>(null);
  readonly loading = signal(true);
  readonly error = signal<SolutionApiError | null>(null);
  readonly teamTab = signal(false);
  readonly programId = signal(0);
  readonly refreshingTeam = signal(false);
  readonly teamRefreshError = signal("");
  readonly routes = AppRoutes;
  private readonly retry = new Subject<void>();
  private readonly teamRefresh = new Subject<{ programId: number; solutionId: number } | null>();

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
          this.solution.set(result.value);
          return;
        }
        if (["not_found", "forbidden", "authentication_required"].includes(result.error.code)) {
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

  answer(fieldId: number): string {
    const value = this.solution()?.answers.find(answer => answer.fieldId === fieldId)?.value;
    if (value === null || value === undefined || value === "") return "Не заполнено";
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    // File metadata is displayed as text until the validated download flow in FE03.
    return typeof value === "object" ? "Файл прикреплен" : String(value);
  }
}
