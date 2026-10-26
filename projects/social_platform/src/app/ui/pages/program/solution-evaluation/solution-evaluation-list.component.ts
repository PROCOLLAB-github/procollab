/** @format */

import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import { GetSolutionRatingsUseCase } from "@api/solution/use-cases/solution-evaluation.use-cases";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { EvaluationNavigationService } from "@api/program/evaluation-navigation.service";
import { SolutionApiError, SolutionRatingPage } from "@domain/solution/solution-contract.model";
import { ButtonDirective, FieldDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";

@Component({
  selector: "app-solution-evaluation-list",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonDirective,
    FieldDirective,
    IconComponent,
    ModalComponent,
  ],
  templateUrl: "./solution-evaluation-list.component.html",
  styleUrl: "./solution-evaluation.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionEvaluationListComponent {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly get = inject(GetSolutionRatingsUseCase);
  readonly navigation = inject(EvaluationNavigationService);
  readonly program = inject(ProgramDetailMainUIInfoService).program;
  private readonly retry = new Subject<void>();
  private programId = 0;
  private appliedCase = "";
  readonly data = signal<SolutionRatingPage | null>(null);
  readonly loading = signal(true);
  readonly error = signal<SolutionApiError | null>(null);
  readonly search = new FormControl("", { nonNullable: true });
  readonly caseValue = new FormControl("", { nonNullable: true });
  readonly caseOptions = signal<string[]>([]);
  readonly filtersOpen = signal(false);
  readonly page = signal(1);
  readonly status = signal<"pending" | "completed">("pending");
  readonly filtered = signal(false);
  readonly count = computed(() => this.data()?.count ?? 0);
  readonly counts = computed(() => this.data()?.evaluationCounts ?? { pending: 0, completed: 0 });
  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(q => this.navigate({ q: q.trim() || null, page: null }));
    combineLatest([
      combineLatest(this.route.pathFromRoot.map(r => r.paramMap)),
      this.route.queryParamMap,
      this.retry.pipe(startWith(undefined)),
    ])
      .pipe(
        map(([pathParams, params]) => {
          const programId = Number(pathParams.find(p => p.has("programId"))?.get("programId"));
          if (this.programId !== programId) {
            this.programId = programId;
            this.caseOptions.set([]);
          }
          const page = Number(params.get("page"));
          this.page.set(Number.isSafeInteger(page * 20) && page > 0 ? page : 1);
          this.status.set(params.get("status") === "completed" ? "completed" : "pending");
          this.search.setValue(params.get("q") ?? "", { emitEvent: false });
          this.caseValue.setValue(params.get("case") ?? "", { emitEvent: false });
          this.appliedCase = this.caseValue.value;
          this.filtered.set(!!this.search.value || !!this.caseValue.value);
          return {
            status: this.status(),
            search: this.search.value.trim(),
            caseScope: this.caseValue.value ? ("selected" as const) : ("all" as const),
            ...(this.caseValue.value ? { caseName: this.caseValue.value } : {}),
            limit: 20,
            offset: (this.page() - 1) * 20,
          };
        }),
        switchMap(query => {
          this.loading.set(true);
          this.error.set(null);
          this.data.set(null);
          return this.get.execute(this.programId, query);
        }),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        this.loading.set(false);
        if (result.ok && result.value.evaluationCounts) {
          this.data.set(result.value);
          this.caseOptions.set(result.value.caseOptions ?? []);
          this.navigation.restore(this.router.url);
        } else
          this.error.set(
            result.ok
              ? {
                  code: "missing_counts",
                  detail: "Обновите данные оценивания. Не удалось загрузить счетчики.",
                  errors: [],
                  meta: {},
                }
              : result.error,
          );
      });
  }
  openFilters(): void {
    this.caseValue.setValue(this.appliedCase);
    this.filtersOpen.set(true);
  }
  navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
    });
  }
  reload(): void {
    this.retry.next();
  }
  reset(): void {
    this.navigate({ q: null, case: null, page: null });
  }
  setStatus(status: "pending" | "completed"): void {
    this.navigate({ status: status === "completed" ? status : null, page: null });
  }
  applyFilters(): void {
    this.filtersOpen.set(false);
    this.navigate({ case: this.caseValue.value || null, page: null });
  }
}
