/** @format */

import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
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
import {
  GetPublishedSolutionUseCase,
  GetPublishedSolutionsUseCase,
} from "@api/solution/use-cases/solution-publication.use-cases";
import { AppRoutes } from "@api/paths/app-routes";
import {
  SolutionApiError,
  SolutionPublishedSolution,
  SolutionPublishedSolutionPage,
} from "@domain/solution/solution-contract.model";
import { validSolutionId } from "@domain/solution/ports/solution.repository.port";
import { ButtonDirective, FieldDirective, PaginationComponent } from "@uilib";
import { SolutionFieldsComponent } from "@ui/widgets/solution-fields/solution-fields.component";

@Component({
  selector: "app-published-solutions",
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    ButtonDirective,
    FieldDirective,
    PaginationComponent,
    SolutionFieldsComponent,
  ],
  templateUrl: "./published-solutions.component.html",
  styleUrl: "./published-solutions.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishedSolutionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly list = inject(GetPublishedSolutionsUseCase);
  private readonly read = inject(GetPublishedSolutionUseCase);
  private readonly retry = new Subject<void>();
  readonly paths = AppRoutes;
  readonly programId = signal(0);
  readonly solutionId = signal<number | null>(null);
  readonly data = signal<SolutionPublishedSolutionPage | null>(null);
  readonly solution = signal<SolutionPublishedSolution | null>(null);
  readonly materials = signal(new FormGroup({}));
  readonly loading = signal(true);
  readonly error = signal<SolutionApiError | null>(null);
  readonly search = new FormControl("", { nonNullable: true });
  readonly offset = signal(0);
  readonly teamTab = signal(false);
  readonly limit = 20;

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(search => this.navigate({ q: search.trim() || null, offset: null }));
    const context = combineLatest([
      combineLatest(this.route.pathFromRoot.map(r => r.paramMap)),
      this.route.queryParamMap,
    ]).pipe(
      map(([path, query]) => {
        const programId = Number(path.find(p => p.has("programId"))?.get("programId"));
        const raw = path.find(p => p.has("solutionId"))?.get("solutionId");
        const solutionId = raw === undefined || raw === null ? null : Number(raw);
        const offset = Number(query.get("offset"));
        this.teamTab.set(query.get("tab") === "team");
        this.search.setValue(query.get("q") ?? "", { emitEvent: false });
        return {
          programId,
          solutionId,
          search: this.search.value.trim(),
          offset: Number.isSafeInteger(offset) && offset >= 0 ? offset : 0,
        };
      }),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    );
    combineLatest([context, this.retry.pipe(startWith(undefined))])
      .pipe(
        switchMap(([ctx]) => {
          this.programId.set(ctx.programId);
          this.solutionId.set(ctx.solutionId);
          this.offset.set(ctx.offset);
          this.data.set(null);
          this.solution.set(null);
          this.error.set(null);
          this.loading.set(true);
          if (
            !validSolutionId(ctx.programId) ||
            (ctx.solutionId !== null && !validSolutionId(ctx.solutionId))
          ) {
            this.loading.set(false);
            this.error.set({
              code: "not_found",
              detail: "Решение не найдено.",
              errors: [],
              meta: {},
            });
            return [];
          }
          return ctx.solutionId === null
            ? this.list
                .execute(ctx.programId, {
                  search: ctx.search,
                  offset: ctx.offset,
                  limit: this.limit,
                })
                .pipe(map(result => ({ kind: "list" as const, result })))
            : this.read
                .execute(ctx.programId, ctx.solutionId)
                .pipe(map(result => ({ kind: "detail" as const, result })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(response => {
        this.loading.set(false);
        if (response.kind === "list") {
          if (response.result.ok) this.data.set(response.result.value);
          else this.error.set(response.result.error);
        } else if (response.result.ok) {
          this.solution.set(response.result.value);
          this.materials.set(
            new FormGroup(
              Object.fromEntries(
                response.result.value.answers.map(a => [
                  String(a.fieldId),
                  new FormControl(a.value),
                ]),
              ),
            ),
          );
        } else this.error.set(response.result.error);
      });
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
  page(direction: number): void {
    this.navigate({ offset: Math.max(0, this.offset() + direction * this.limit) || null });
  }
  listQuery(): Record<string, string | number | null> {
    return { q: this.search.value.trim() || null, offset: this.offset() || null };
  }
}
