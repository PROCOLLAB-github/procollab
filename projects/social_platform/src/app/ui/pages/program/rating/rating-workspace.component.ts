/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, Subscription, debounceTime, distinctUntilChanged } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Result } from "@domain/shared/result.type";
import { ButtonDirective, FieldDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";
import { FilterProjectRatingsUseCase } from "@api/program/use-cases/filter-project-ratings.use-case";
import { GetProgramFiltersUseCase } from "@api/program/use-cases/get-program-filters.use-case";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { EvaluationNavigationService } from "@api/program/evaluation-navigation.service";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { ProjectRate } from "@domain/project/project-rate";
import { RatingCardComponent } from "../detail/list/rating-card/rating-card.component";

@Component({
  selector: "app-rating-workspace",
  templateUrl: "./rating-workspace.component.html",
  styleUrl: "./rating-workspace.component.scss",
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonDirective,
    FieldDirective,
    IconComponent,
    ModalComponent,
    RatingCardComponent,
  ],
  providers: [ExportFileInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingWorkspaceComponent implements OnInit, OnDestroy {
  protected readonly Object = Object;
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getRatings = inject(GetProjectRatingsUseCase);
  private readonly filterRatings = inject(FilterProjectRatingsUseCase);
  private readonly getFilters = inject(GetProgramFiltersUseCase);
  readonly exports = inject(ExportFileInfoService);
  readonly navigation = inject(EvaluationNavigationService);
  readonly program = inject(ProgramDetailMainUIInfoService).program;
  readonly card = viewChild(RatingCardComponent);
  readonly more = viewChild<ElementRef<HTMLElement>>("more");
  readonly rows = signal<ProjectRate[]>([]);
  readonly project = signal<ProjectRate | null>(null);
  readonly loading = signal(false);
  readonly failed = signal<string | null>(null);
  readonly unauthorized = signal(false);
  readonly count = signal(0);
  readonly counts = signal({ pending: 0, completed: 0 });
  readonly status = signal<"pending" | "completed">("pending");
  readonly fields = signal<PartnerProgramFields[]>([]);
  readonly filtersFailed = signal(false);
  readonly filtersOpen = signal(false);
  readonly leaveOpen = signal(false);
  readonly search = new FormControl("", { nonNullable: true });
  readonly projectId = Number(this.route.snapshot.paramMap.get("projectId")) || null;
  readonly base = `/office/program/${this.program()?.id}/projects-rating`;
  readonly returnUrl = this.validReturn(this.route.snapshot.queryParamMap.get("returnUrl"));
  readonly returnTree = this.router.parseUrl(this.returnUrl);
  readonly fromCabinet = this.returnUrl.startsWith("/office/evaluation");
  readonly expired = computed(() => {
    const end = Date.parse(this.program()?.datetimeEvaluationEnds ?? "");
    return Number.isFinite(end) && end < Date.now();
  });
  activeFilters: Record<string, string[]> = {};
  draftFilters: Record<string, string[]> = {};
  private request?: Subscription;
  private visibleLimit = 10;
  private resolveLeave?: (leave: boolean) => void;

  constructor() {
    effect(onCleanup => {
      const target = this.more()?.nativeElement;
      if (!target || this.loading() || this.failed()) return;
      const observer = new IntersectionObserver(
        entries => {
          if (entries.some(entry => entry.isIntersecting) && !this.loading()) this.load(true);
        },
        { root: document.querySelector(".office__body"), rootMargin: "120px" },
      );
      observer.observe(target);
      onCleanup(() => observer.disconnect());
    });
  }

  ngOnInit(): void {
    const oldId = Number(this.route.snapshot.queryParamMap.get("project_id"));
    if (!this.projectId && Number.isSafeInteger(oldId) && oldId > 0) {
      void this.router.navigate([this.base, oldId], {
        queryParams: { returnUrl: this.returnUrl },
        replaceUrl: true,
      });
      return;
    }
    this.search.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(q => this.navigate({ q: q.trim() || null }));
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.status.set(params.get("status") === "completed" ? "completed" : "pending");
      this.search.setValue(params.get("q") ?? params.get("name__contains") ?? "", {
        emitEvent: false,
      });
      this.activeFilters = {};
      for (const key of params.keys)
        if (key.startsWith("filter.")) this.activeFilters[key.slice(7)] = params.getAll(key);
      for (const field of this.fields()) {
        if (!this.activeFilters[field.name] && params.has(field.name))
          this.activeFilters[field.name] = params.getAll(field.name);
      }
      this.visibleLimit = this.navigation.limit(this.router.url);
      this.load();
    });
    if (!this.projectId) this.loadFilters();
  }
  loadFilters(): void {
    this.filtersFailed.set(false);
    this.getFilters
      .execute(this.program()!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.ok) {
          this.fields.set(
            result.value.filter(field => ["select", "radio", "checkbox"].includes(field.fieldType)),
          );
          // Existing bookmarks used raw field names, before namespaced filter URLs.
          const params = this.route.snapshot.queryParamMap;
          let restored = false;
          for (const field of this.fields()) {
            if (!this.activeFilters[field.name] && params.has(field.name)) {
              this.activeFilters[field.name] = params.getAll(field.name);
              restored = true;
            }
          }
          if (restored) this.load();
        } else this.filtersFailed.set(true);
      });
  }
  load(append = false): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.failed.set(null);
    this.unauthorized.set(false);
    if (!append) {
      this.rows.set([]);
      this.project.set(null);
    }
    let params = new HttpParams()
      .set("limit", append ? 10 : this.visibleLimit)
      .set("offset", append ? this.rows().length : 0);
    if (this.projectId) params = params.set("project_id", this.projectId);
    else {
      params = params.set("evaluation_status", this.status());
      if (this.search.value.trim()) params = params.set("name__contains", this.search.value.trim());
      const legacyRated = this.route.snapshot.queryParamMap.get("is_rated_by_expert");
      if (legacyRated !== null) params = params.set("is_rated_by_expert", legacyRated);
    }
    const source: Observable<
      Result<ApiPagination<ProjectRate>, { kind: string; cause?: unknown }>
    > =
      !this.projectId && Object.keys(this.activeFilters).length
        ? this.filterRatings.execute(this.program()!.id, this.activeFilters, params)
        : this.getRatings.execute(this.program()!.id, params);
    this.request = source.subscribe(result => {
      this.loading.set(false);
      if (!result.ok) {
        const error = result.error.cause;
        this.unauthorized.set(error instanceof HttpErrorResponse && error.status === 401);
        this.failed.set(
          error instanceof HttpErrorResponse && error.status === 403
            ? "У вас нет доступа к оценке проектов этой программы."
            : "Не удалось загрузить проекты. Попробуйте еще раз.",
        );
        return;
      }
      if (this.projectId) {
        this.project.set(result.value.results.find(p => p.id === this.projectId) ?? null);
        if (!this.project())
          this.failed.set("Проект недоступен для оценки. Возможно, назначение было отменено.");
      } else {
        this.rows.update(rows =>
          append ? [...rows, ...result.value.results] : result.value.results,
        );
        this.visibleLimit = this.rows().length;
        this.count.set(result.value.count);
        const data = result.value as typeof result.value & {
          evaluationCounts?: { pending: number; completed: number };
        };
        if (!data.evaluationCounts) {
          this.rows.set([]);
          this.failed.set("Не удалось загрузить данные об оценках. Обновите страницу.");
          return;
        }
        this.counts.set(data.evaluationCounts);
        if (!append) this.navigation.restore(this.router.url);
      }
    });
  }
  navigate(queryParams: Record<string, string | string[] | null>): void {
    if ("q" in queryParams) queryParams = { ...queryParams, name__contains: null };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
    });
  }
  setStatus(status: "pending" | "completed"): void {
    this.navigate({ status: status === "pending" ? null : status });
  }
  openFilters(): void {
    this.draftFilters = structuredClone(this.activeFilters);
    this.filtersOpen.set(true);
  }
  setFilter(name: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.draftFilters[name] = Array.from(select.selectedOptions, option => option.value).filter(
      Boolean,
    );
  }
  applyFilters(): void {
    const query: Record<string, string[] | null> = {};
    for (const name of new Set([
      ...Object.keys(this.activeFilters),
      ...Object.keys(this.draftFilters),
    ])) {
      query[`filter.${name}`] = this.draftFilters[name]?.length ? this.draftFilters[name] : null;
      query[name] = null;
    }
    this.filtersOpen.set(false);
    this.navigate(query);
  }
  remember(): void {
    this.navigation.remember(this.router.url, this.visibleLimit);
  }
  canLeave(): Promise<boolean> | boolean {
    if (this.card()?.state.submitLoading()) return false;
    if (!this.card()?.hasUnsavedChanges()) return true;
    this.card()?.state.showConfirmRateModal.set(false);
    if (this.resolveLeave) return false;
    this.leaveOpen.set(true);
    return new Promise(resolve => {
      this.resolveLeave = resolve;
    });
  }
  answerLeave(leave: boolean): void {
    this.leaveOpen.set(false);
    this.resolveLeave?.(leave);
    this.resolveLeave = undefined;
  }
  @HostListener("window:beforeunload", ["$event"])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.card()?.hasUnsavedChanges() || this.card()?.state.submitLoading()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.resolveLeave?.(false);
  }
  private validReturn(value: string | null): string {
    if (
      value &&
      (/^\/office\/evaluation(?:\?[^#]*)?$/.test(value) || value.split("?")[0] === this.base) &&
      !value.includes("project_id=")
    )
      return value;
    return this.base;
  }
}
