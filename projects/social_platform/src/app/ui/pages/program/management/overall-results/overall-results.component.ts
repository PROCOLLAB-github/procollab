/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, ParamMap, Router, RouterLink } from "@angular/router";
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { saveAs } from "file-saver";
import { AlertDirective, ButtonDirective, FieldDirective, IconComponent } from "@uilib";
import { authLoginUrl } from "@core/lib/models/auth/auth-return-url";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import {
  OverallResultProject,
  OverallResultStatus,
  ProgramOverallResults,
} from "@domain/program/program-overall-results.model";
import { ResultsQuery } from "@domain/program/program-results.model";
import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";

interface Context {
  programId: number;
  query: ResultsQuery;
}

const statusLabels: Record<OverallResultStatus, string> = {
  configuration_required: "Не настроена оценка кейса",
  pending_both: "Ожидает кейс и квиз",
  pending_case: "Ожидает кейс",
  pending_quiz: "Ожидает квиз",
  complete: "В рейтинге",
};

function routeFilters(params: ParamMap): ResultsQuery {
  const status = params.get("status");
  return {
    search: (params.get("search") ?? "").slice(0, 200),
    status: status === "complete" || status === "pending" ? status : "all",
    caseScope: "all",
    order: "desc",
    scope: "current",
  };
}

@Component({
  selector: "app-management-overall-results",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertDirective,
    ButtonDirective,
    FieldDirective,
    IconComponent,
    TransientNoticeComponent,
  ],
  templateUrl: "./overall-results.component.html",
  styleUrls: ["../results/results.component.scss", "./overall-results.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementOverallResultsComponent {
  readonly programId = input.required<number>();
  private readonly api = inject(ProgramManagementUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly requests = new Subject<Context>();
  private context: Context | null = null;
  private readonly query = toSignal(
    this.route.queryParamMap.pipe(
      map(routeFilters),
      distinctUntilChanged((a, b) => a.search === b.search && a.status === b.status),
    ),
    { initialValue: routeFilters(this.route.snapshot.queryParamMap) },
  );
  readonly paths = AppRoutes;
  readonly snapshot = signal<ProgramOverallResults | null>(null);
  readonly loading = signal(false);
  readonly error = signal<HttpErrorResponse | null>(null);
  readonly search = this.fb.control("");
  readonly statusFilter = this.fb.control<"all" | "complete" | "pending">("all");
  readonly exporting = signal(false);
  readonly exportError = signal(false);
  readonly exportSuccess = signal(false, { equal: () => false });
  readonly updatedTime = computed(() => {
    const date = new Date(this.snapshot()?.generatedAt ?? "");
    return Number.isNaN(date.getTime())
      ? null
      : date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Moscow",
        });
  });
  readonly hasFilters = computed(() => !!this.query().search || this.query().status !== "all");
  readonly errorMessage = computed(() => {
    switch (this.error()?.status) {
      case 401:
        return "Войдите, чтобы открыть общий рейтинг";
      case 403:
        return "У вас нет доступа к общему рейтингу этой программы";
      case 404:
        return "Программа не найдена";
      case 409:
        return "Общий рейтинг недоступен для текущих настроек программы";
      default:
        return "Не удалось загрузить общий рейтинг";
    }
  });

  constructor() {
    this.requests
      .pipe(
        switchMap(context => {
          this.context = context;
          this.loading.set(true);
          this.error.set(null);
          this.exportError.set(false);
          this.exportSuccess.set(false);
          return this.api.overallResults(context.programId, context.query).pipe(
            tap(data => this.snapshot.set(data)),
            catchError((error: HttpErrorResponse) => {
              this.snapshot.set(null);
              this.error.set(error);
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    effect(() => {
      const programId = this.programId(),
        query = this.query();
      untracked(() => {
        if (this.context?.programId !== programId) this.snapshot.set(null);
        this.search.setValue(query.search, { emitEvent: false });
        this.statusFilter.setValue(query.status ?? "all", { emitEvent: false });
        this.requests.next({ programId, query });
      });
    });
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.saveFilters());
    this.statusFilter.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.saveFilters());
  }

  private saveFilters(): void {
    const search = this.search.value.slice(0, 200),
      status = this.statusFilter.value;
    if (search === this.query().search && status === this.query().status) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: search || null, status: status === "all" ? null : status },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  clearFilters(): void {
    this.search.setValue("", { emitEvent: false });
    this.statusFilter.setValue("all", { emitEvent: false });
    this.saveFilters();
  }

  refresh(): void {
    if (!this.loading() && !this.filtersPending() && this.context) this.requests.next(this.context);
  }

  filtersPending(): boolean {
    return (
      this.search.value.slice(0, 200) !== this.query().search ||
      this.statusFilter.value !== this.query().status
    );
  }

  signIn(): void {
    void this.router.navigateByUrl(authLoginUrl(this.router.url));
  }

  format(value: number | null): string {
    return value === null
      ? "Ожидает"
      : value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  statusLabel(row: OverallResultProject): string {
    const label = statusLabels[row.status];
    if (row.caseStatus === "pending")
      return `${label}: ${row.caseEvaluatorsCompleted} из ${row.caseEvaluatorsRequired} оценок кейса`;
    if (row.caseStatus === "not_submitted") return `${label}. Кейс не сдан`;
    return label;
  }

  download(): void {
    const data = this.snapshot(),
      context = this.context;
    if (
      this.loading() ||
      this.filtersPending() ||
      this.exporting() ||
      !data?.matchingCount ||
      !data.caseScoringConfigured ||
      !context
    )
      return;
    this.exporting.set(true);
    this.exportError.set(false);
    this.exportSuccess.set(false);
    this.api
      .exportOverallResults(context.programId, context.query)
      .pipe(
        takeUntil(this.requests),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exporting.set(false)),
      )
      .subscribe({
        next: file => {
          saveAs(file, `program-${context.programId}-overall-results.xlsx`);
          this.exportSuccess.set(true);
        },
        error: () => this.exportError.set(true),
      });
  }
}
