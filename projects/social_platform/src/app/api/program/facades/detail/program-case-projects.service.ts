/** @format */
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, takeUntil } from "rxjs";
import { GetProgramCaseProjectsUseCase } from "@api/program/use-cases/get-program-case-projects.use-case";
import { ExportProgramCaseProjectsUseCase } from "@api/program/use-cases/export-program-case-projects.use-case";
import {
  ProgramCaseError,
  ProgramCasePage,
  ProgramCaseSelection,
} from "@domain/program/program-case-analytics.model";
import { ProgramAnalyticsCaseMetrics } from "@domain/program/program-analytics.model";
import { saveCaseProjects } from "@utils/program-case-analytics";

/** Отдельный экземпляр для блока Кейсы и для существующей AnalyticsDrilldown. */
@Injectable({ providedIn: "root" })
export class ProgramCaseProjectsService {
  private readonly getProjects = inject(GetProgramCaseProjectsUseCase);
  private readonly exportProjects = inject(ExportProgramCaseProjectsUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelList = new Subject<void>();
  private readonly cancelExport = new Subject<void>();
  private programId: number | null = null;
  private programName = "program";
  readonly selection = signal<ProgramCaseSelection | null>(null);
  readonly page = signal<ProgramCasePage | null>(null);
  readonly metrics = signal<ProgramAnalyticsCaseMetrics | null>(null);
  readonly submissionApplicable = signal(false);
  readonly pending = signal(false);
  readonly error = signal<ProgramCaseError | null>(null);
  readonly searchDraft = signal("");
  readonly search = signal("");
  readonly offset = signal(0);
  readonly limit = 25;
  readonly exportPending = signal(false);
  readonly exportError = signal<ProgramCaseError | null>(null);
  private readonly confirmed = signal(false);
  private readonly total = signal(0);
  readonly canExport = computed(
    () => this.confirmed() && this.total() > 0 && !this.exportPending(),
  );
  readonly hasNext = computed(() => {
    const page = this.page();
    return !!page && this.offset() + page.results.length < page.count;
  });
  readonly range = computed(() => {
    const page = this.page();
    return page?.results.length
      ? `${this.offset() + 1}–${this.offset() + page.results.length} из ${page.count}`
      : `0 из ${page?.count ?? 0}`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.reset());
  }

  open(
    programId: number,
    selection: ProgramCaseSelection,
    metrics: ProgramAnalyticsCaseMetrics | null = null,
    applicable = false,
    programName = "program",
  ): void {
    this.reset();
    if (!Number.isInteger(programId) || programId <= 0) return;
    this.programId = programId;
    this.programName = programName;
    this.selection.set(selection);
    this.metrics.set(metrics);
    this.submissionApplicable.set(applicable);
    this.load();
  }

  load(): void {
    const selection = this.selection();
    if (this.programId === null || !selection) return;
    this.cancelList.next();
    this.page.set(null);
    this.pending.set(true);
    this.error.set(null);
    this.getProjects
      .execute(this.programId, {
        selection,
        search: this.search(),
        limit: selection.scope === "all" ? 1 : this.limit,
        offset: this.offset(),
      })
      .pipe(takeUntil(this.cancelList), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.pending.set(false);
        if (result.ok) {
          this.page.set(result.value);
          this.metrics.set(result.value.caseMetrics);
          this.submissionApplicable.set(result.value.submissionApplicable);
          this.total.set(result.value.caseMetrics?.projectsTotal ?? result.value.count);
          this.confirmed.set(true);
        } else {
          this.error.set(result.error);
          this.confirmed.set(false);
          this.cancelExport.next();
          this.exportPending.set(false);
        }
      });
  }

  applySearch(): void {
    this.search.set(this.searchDraft().trim());
    this.offset.set(0);
    this.load();
  }
  clearSearch(): void {
    this.searchDraft.set("");
    this.applySearch();
  }
  changePage(direction: -1 | 1): void {
    if (this.pending() || (direction === 1 ? !this.hasNext() : this.offset() === 0)) return;
    this.offset.update(offset => Math.max(0, offset + direction * this.limit));
    this.load();
  }

  download(): void {
    const selection = this.selection();
    const programId = this.programId;
    if (programId === null || !selection || !this.canExport()) return;
    this.exportPending.set(true);
    this.exportError.set(null);
    this.exportProjects
      .execute(programId, selection)
      .pipe(takeUntil(this.cancelExport), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.exportPending.set(false);
        if (result.ok) saveCaseProjects(result.value, this.programName, selection);
        else {
          this.exportError.set(result.error);
          if (result.error.kind !== "network") this.confirmed.set(false);
        }
      });
  }

  /** Поиск отменяет только list; смена кейса/программы и закрытие отменяют также файл. */
  reset(): void {
    this.cancelList.next();
    this.cancelExport.next();
    this.programId = null;
    this.selection.set(null);
    this.page.set(null);
    this.metrics.set(null);
    this.submissionApplicable.set(false);
    this.pending.set(false);
    this.error.set(null);
    this.searchDraft.set("");
    this.search.set("");
    this.offset.set(0);
    this.exportPending.set(false);
    this.exportError.set(null);
    this.confirmed.set(false);
    this.total.set(0);
  }
}
