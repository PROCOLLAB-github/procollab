/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  defer,
  distinctUntilChanged,
  EMPTY,
  finalize,
  switchMap,
} from "rxjs";
import { AlertDirective, ButtonDirective, PaginationComponent } from "@uilib";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ManagedProgramsPage } from "@domain/program/program-launch.model";
import { AppRoutes } from "@api/paths/app-routes";
import { evaluationError } from "@utils/evaluation-workspace";
import { ProgramCardComponent } from "../main/program-card/program-card.component";

@Component({
  selector: "app-managed-programs",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    SearchComponent,
    AlertDirective,
    ButtonDirective,
    PaginationComponent,
    ProgramCardComponent,
  ],
  templateUrl: "./managed.component.html",
  styleUrl: "./managed.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagedProgramsComponent {
  private readonly api = inject(ProgramLaunchUseCase);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly paths = AppRoutes;
  readonly search = new FormControl("", { nonNullable: true });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<ManagedProgramsPage | null>(null);
  readonly canCreate = signal(false);
  readonly offset = signal(0);
  readonly rangeEnd = computed(() => this.offset() + (this.data()?.results.length ?? 0));
  private readonly refresh = new BehaviorSubject(0);
  constructor() {
    this.api
      .capabilities()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({ next: d => this.canCreate.set(d.canCreateProgram), error: () => {} });
    combineLatest([this.route.queryParamMap, this.refresh])
      .pipe(
        switchMap(([params]) =>
          defer(() => {
            const raw = Number(params.get("offset") ?? 0);
            const offset = Number.isSafeInteger(raw) && raw >= 0 ? raw : 0;
            const search = (params.get("search") ?? "").slice(0, 255);
            this.offset.set(offset);
            this.search.setValue(search, { emitEvent: false });
            this.loading.set(true);
            this.error.set(null);
            this.data.set(null);
            return this.api.managed({ search, offset, limit: 10 }).pipe(
              catchError(e => {
                this.error.set(evaluationError(e));
                return EMPTY;
              }),
              finalize(() => this.loading.set(false)),
            );
          }),
        ),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe(data => this.data.set(data));
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroy))
      .subscribe(search => {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { search: search.trim() || null, offset: null },
          queryParamsHandling: "merge",
          replaceUrl: true,
        });
      });
  }
  page(delta: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { offset: Math.max(0, this.offset() + delta * 10) || null },
      queryParamsHandling: "merge",
    });
  }
  reload() {
    this.refresh.next(this.refresh.value + 1);
  }
}
