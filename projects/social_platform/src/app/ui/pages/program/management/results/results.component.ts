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
import { NgTemplateOutlet } from "@angular/common";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { Subject, finalize, switchMap, catchError, of, tap, takeUntil } from "rxjs";
import { saveAs } from "file-saver";
import {
  AlertDirective,
  AvatarComponent,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
} from "@uilib";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import {
  ProgramResults,
  ResultExpert,
  ResultProject,
  ResultsQuery,
} from "@domain/program/program-results.model";
import { ManagementCriterion } from "@domain/program/program-criteria.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-management-results",
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    AlertDirective,
    AvatarComponent,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    ModalComponent,
  ],
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementResultsComponent {
  readonly programId = input.required<number>();
  private readonly api = inject(ProgramManagementUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly requests = new Subject<number>();
  readonly snapshot = signal<ProgramResults | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly search = this.fb.control("");
  readonly caseFilter = this.fb.control("all");
  private readonly searchValue = toSignal(this.search.valueChanges, { initialValue: "" });
  private readonly caseValue = toSignal(this.caseFilter.valueChanges, { initialValue: "all" });
  readonly order = signal<"asc" | "desc">("desc");
  readonly expanded = signal(new Set<number>());
  readonly expandedExperts = signal(new Set<string>());
  readonly modal = signal<"formula" | "export" | null>(null);
  readonly exportScope = signal<"current" | "all">("current");
  readonly exporting = signal(false);
  readonly exportError = signal(false);
  readonly exportSuccess = signal(false);
  readonly href = presentationHref;
  readonly caseKey = (name: string): string => JSON.stringify(name);
  readonly format = (value: number | null | undefined): string =>
    value == null
      ? "—"
      : value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  readonly numericCriteria = computed(
    () => this.snapshot()?.criteria.filter(c => c.type === "int" || c.type === "float") ?? [],
  );
  readonly matrixCriteria = computed(
    () => this.snapshot()?.criteria.filter(c => c.type !== "str") ?? [],
  );
  readonly comments = computed(() => this.snapshot()?.criteria.filter(c => c.type === "str") ?? []);
  readonly groups = computed(() => {
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
              Number(!a.ready) - Number(!b.ready) ||
              Number(a.score === null) - Number(b.score === null) ||
              (this.order() === "desc" ? -1 : 1) * ((a.score ?? 0) - (b.score ?? 0)) ||
              this.compareNames(a, b),
          ),
      }))
      .filter(g => g.projects.length);
  });
  readonly readyCount = computed(
    () =>
      this.groups()
        .flatMap(g => g.projects)
        .filter(p => p.ready).length,
  );
  readonly pendingCount = computed(
    () =>
      this.groups()
        .flatMap(g => g.projects)
        .filter(p => !p.ready).length,
  );
  readonly projectCount = computed(() => this.readyCount() + this.pendingCount());
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
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap(id =>
          this.api.results(id).pipe(
            tap(data => this.snapshot.set(data)),
            catchError(() => {
              this.error.set(true);
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    effect(() => {
      const id = this.programId();
      untracked(() => {
        this.snapshot.set(null);
        this.expanded.set(new Set());
        this.expandedExperts.set(new Set());
        this.search.setValue("");
        this.caseFilter.setValue("all");
        this.order.set("desc");
        this.modal.set(null);
        this.exportSuccess.set(false);
        this.load(id);
      });
    });
  }
  load(id = this.programId()): void {
    this.requests.next(id);
  }
  private compareNames(a: ResultProject, b: ResultProject): number {
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
  toggleExpert(key: string): void {
    this.expandedExperts.update(ids => {
      const next = new Set(ids);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  ready(projects: ResultProject[]): ResultProject[] {
    return projects.filter(p => p.ready);
  }
  pending(projects: ResultProject[]): ResultProject[] {
    return projects.filter(p => !p.ready);
  }
  initials(expert: ResultExpert): string {
    return expert.name
      .split(/\s+/)
      .slice(0, 2)
      .map(v => v[0])
      .join("");
  }
  value(expert: ResultExpert, criterion: ManagementCriterion): string {
    const value = expert.values.find(v => v.criterionId === criterion.id)?.value;
    return value === "True" && criterion.type === "bool"
      ? "Да"
      : value === "False" && criterion.type === "bool"
        ? "Нет"
        : value == null || value === ""
          ? "—"
          : value;
  }
  openModal(kind: "formula" | "export"): void {
    this.exportError.set(false);
    this.exportScope.set("current");
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
    };
    this.exporting.set(true);
    this.exportError.set(false);
    this.exportSuccess.set(false);
    this.api
      .exportResults(this.programId(), query)
      .pipe(
        takeUntil(this.requests),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exporting.set(false)),
      )
      .subscribe({
        next: file => {
          saveAs(file, `program-${this.programId()}-results.xlsx`);
          this.modal.set(null);
          this.exportSuccess.set(true);
        },
        error: () => this.exportError.set(true),
      });
  }
}
