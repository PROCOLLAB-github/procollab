/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  Injector,
  input,
  signal,
  untracked,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { CdkMenuModule } from "@angular/cdk/menu";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { PluralizePipe } from "@corelib";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { Subject, finalize, switchMap, catchError, of, tap, takeUntil } from "rxjs";
import { saveAs } from "file-saver";
import {
  AlertDirective,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  IconComponent,
} from "@uilib";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramResults, ResultEntry, ResultsQuery } from "@domain/program/program-results.model";
import { GetSolutionResultsUseCase } from "@api/solution/use-cases/solution-evaluation.use-cases";
import { ExportSolutionResultsUseCase } from "@api/solution/use-cases/solution-results-export.use-case";
import { map } from "rxjs";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ResultProjectScoresComponent } from "./result-project-scores.component";

import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";

@Component({
  selector: "app-management-results",
  imports: [
    TransientNoticeComponent,
    CdkMenuModule,
    IconComponent,
    PluralizePipe,
    ReactiveFormsModule,
    NgTemplateOutlet,
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    ModalComponent,
    ResultProjectScoresComponent,
  ],
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementResultsComponent {
  readonly programId = input.required<number>();
  readonly solutionMode = input(false);
  readonly submissionApplicable = input(true);
  private readonly injector = inject(Injector);
  private readonly api = inject(ProgramManagementUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly requests = new Subject<number>();
  readonly snapshot = signal<ProgramResults | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly search = this.fb.control("");
  readonly caseFilter = this.fb.control("all");
  readonly statusFilter = this.fb.control<"all" | "complete" | "pending">("all");
  readonly draftCase = this.fb.control("all");
  readonly draftStatus = this.fb.control<"all" | "complete" | "pending">("all");
  private readonly searchValue = toSignal(this.search.valueChanges, { initialValue: "" });
  private readonly caseValue = toSignal(this.caseFilter.valueChanges, { initialValue: "all" });
  private readonly statusValue = toSignal(this.statusFilter.valueChanges, { initialValue: "all" });
  readonly order = signal<"asc" | "desc">("desc");
  readonly expanded = signal(new Set<number>());
  readonly expandedExperts = signal(new Set<string>());
  readonly modal = signal<"formula" | "export" | "filters" | null>(null);
  readonly exportScope = signal<"current" | "all">("current");
  readonly exporting = signal(false);
  readonly exportError = signal(false);
  readonly exportSuccess = signal(false, { equal: () => false });
  readonly pageSize = 20;
  readonly page = signal(0);
  readonly sortPositions: ConnectedPosition[] = [
    { originX: "end", originY: "bottom", overlayX: "end", overlayY: "top", offsetY: 4 },
    { originX: "end", originY: "top", overlayX: "end", overlayY: "bottom", offsetY: -4 },
  ];
  readonly sortLabel = computed(() =>
    this.order() === "desc" ? "Сначала высокий балл" : "Сначала низкий балл",
  );
  readonly filterCount = computed(
    () => Number(this.caseValue() !== "all") + Number(this.statusValue() !== "all"),
  );
  readonly isComplete = (project: ResultEntry): boolean =>
    project.evaluationComplete ?? project.ready;
  readonly caseKey = (name: string): string => JSON.stringify(name);
  readonly format = (value: number | null | undefined): string =>
    value == null
      ? "—"
      : value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  readonly numericCriteria = computed(
    () => this.snapshot()?.criteria.filter(c => c.type === "int" || c.type === "float") ?? [],
  );
  readonly matchingGroups = computed(() => {
    const key = this.caseValue(),
      query = this.searchValue().trim().toLocaleLowerCase("ru");
    return (this.snapshot()?.groups ?? [])
      .filter(g => key === "all" || JSON.stringify(g.caseName) === key)
      .map(g => ({
        ...g,
        projects: g.projects
          .filter(p => p.name.toLocaleLowerCase("ru").includes(query))
          .sort(
            (a, b) =>
              Number(!this.isComplete(a)) - Number(!this.isComplete(b)) ||
              Number(a.score === null) - Number(b.score === null) ||
              (this.order() === "desc" ? -1 : 1) * ((a.score ?? 0) - (b.score ?? 0)) ||
              this.compareNames(a, b),
          ),
      }))
      .filter(g => g.projects.length);
  });
  readonly groups = computed(() =>
    this.matchingGroups()
      .map(g => ({
        ...g,
        projects: g.projects.filter(
          p =>
            this.statusValue() === "all" ||
            this.isComplete(p) === (this.statusValue() === "complete"),
        ),
      }))
      .filter(g => g.projects.length),
  );
  readonly readyCount = computed(
    () =>
      this.matchingGroups()
        .flatMap(g => g.projects)
        .filter(p => this.isComplete(p)).length,
  );
  readonly pendingCount = computed(
    () =>
      this.matchingGroups()
        .flatMap(g => g.projects)
        .filter(p => !this.isComplete(p)).length,
  );
  readonly matchingCount = computed(() => this.readyCount() + this.pendingCount());
  readonly projectCount = computed(() =>
    this.groups().reduce((count, g) => count + g.projects.length, 0),
  );
  readonly allCount = computed(
    () => this.snapshot()?.groups.reduce((count, g) => count + g.projects.length, 0) ?? 0,
  );
  readonly currentPage = computed(() =>
    Math.min(this.page(), Math.max(0, Math.ceil(this.projectCount() / this.pageSize) - 1)),
  );
  readonly pageStart = computed(() =>
    this.projectCount() ? this.currentPage() * this.pageSize + 1 : 0,
  );
  readonly pageEnd = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize, this.projectCount()),
  );
  readonly pageGroups = computed(() => {
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    let offset = 0;
    return this.groups()
      .map(group => {
        const projects = group.projects.slice(
          Math.max(0, start - offset),
          Math.max(0, end - offset),
        );
        offset += group.projects.length;
        return { ...group, projects };
      })
      .filter(group => group.projects.length);
  });
  readonly updatedTime = computed(() => {
    const date = new Date(this.snapshot()?.generatedAt ?? "");
    return Number.isNaN(date.getTime())
      ? null
      : date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  });
  readonly sample = computed(() =>
    this.snapshot()
      ?.groups.flatMap(g => g.projects)
      .find(p => p.score !== null),
  );
  readonly sampleFormula = computed(() => {
    const p = this.sample(),
      experts = p?.experts.filter(e => e.complete) ?? [];
    return p && experts.length
      ? `(${experts.map(e => this.format(e.total)).join(" + ")}) / ${experts.length} = ${this.format(p.score)}`
      : null;
  });
  constructor() {
    this.requests
      .pipe(
        switchMap(id => {
          this.loading.set(true);
          this.error.set(false);
          const request = this.solutionMode()
            ? this.injector
                .get(GetSolutionResultsUseCase)
                .execute(id)
                .pipe(
                  map(result => {
                    if (!result.ok) throw result.error;
                    const data = result.value;
                    return {
                      ...data,
                      groups: data.groups.map(group => ({
                        caseName: group.caseName,
                        projects: group.solutions.map(solution => ({
                          ...solution,
                          id: solution.solutionId,
                        })),
                      })),
                    } satisfies ProgramResults;
                  }),
                )
            : this.api.results(id);
          return request.pipe(
            tap(data => {
              this.snapshot.set(data);
              this.page.set(this.currentPage());
            }),
            catchError(() => {
              this.error.set(true);
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    effect(() => {
      const id = this.programId();
      this.solutionMode();
      untracked(() => {
        this.snapshot.set(null);
        this.expanded.set(new Set());
        this.expandedExperts.set(new Set());
        this.search.setValue("");
        this.caseFilter.setValue("all");
        this.statusFilter.setValue("all");
        this.page.set(0);
        this.order.set("desc");
        this.modal.set(null);
        this.exportSuccess.set(false);
        this.load(id);
      });
    });
    effect(() => {
      this.searchValue();
      this.caseValue();
      this.statusValue();
      this.order();
      untracked(() => this.page.set(0));
    });
  }
  load(id = this.programId()): void {
    this.requests.next(id);
  }
  refresh(): void {
    if (!this.loading()) this.load();
  }
  togglePending(): void {
    this.statusFilter.setValue(this.statusValue() === "pending" ? "all" : "pending");
  }
  applyFilters(): void {
    this.caseFilter.setValue(this.draftCase.value);
    this.statusFilter.setValue(this.draftStatus.value);
    this.modal.set(null);
  }
  private compareNames(a: ResultEntry, b: ResultEntry): number {
    const first = a.name.toLowerCase(),
      second = b.name.toLowerCase();
    return first === second ? a.id - b.id : first < second ? -1 : 1;
  }
  toggle(id: number): void {
    this.expanded.update(ids => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  openModal(kind: "formula" | "export" | "filters"): void {
    this.exportError.set(false);
    this.exportScope.set("current");
    if (kind === "filters") {
      this.draftCase.setValue(this.caseValue());
      this.draftStatus.setValue(this.statusValue());
    }
    this.modal.set(kind);
  }
  download(): void {
    if (this.exporting()) return;
    const selected = this.caseValue();
    const query: ResultsQuery = {
      search: this.searchValue().trim(),
      caseScope: selected === "all" ? "all" : selected === "null" ? "without_case" : "selected",
      caseName: selected !== "all" && selected !== "null" ? JSON.parse(selected) : undefined,
      order: this.order(),
      scope: this.exportScope(),
      status: this.statusValue(),
    };
    this.exporting.set(true);
    this.exportError.set(false);
    this.exportSuccess.set(false);
    const request = this.solutionMode()
      ? this.injector
          .get(ExportSolutionResultsUseCase)
          .execute(this.programId(), query)
          .pipe(
            map(result => {
              if (!result.ok) throw result.error;
              return result.value;
            }),
          )
      : this.api.exportResults(this.programId(), query);
    request
      .pipe(
        takeUntil(this.requests),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exporting.set(false)),
      )
      .subscribe({
        next: file => {
          saveAs(file, `program-${this.programId()}-results.xlsx`);
          if (this.modal() === "export") this.modal.set(null);
          this.exportSuccess.set(true);
        },
        error: () => this.exportError.set(true),
      });
  }
}
