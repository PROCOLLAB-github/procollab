/** @format */

import { HttpParams } from "@angular/common/http";
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, switchMap } from "rxjs";
import { ParticipatingProgramUseCase } from "../use-cases/participating-program.use-case";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";

/** Актуальная страница публичного каталога; поиск и фильтры применяются на сервере. */
@Injectable()
export class ProgramMainInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navService = inject(NavService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(ParticipatingProgramUseCase);
  private readonly ui = inject(ProgramMainUIInfoService);
  private readonly refresh = new BehaviorSubject(0);

  readonly pageSize = 20;
  readonly isPparticipating = this.ui.isPparticipating;
  readonly programs = this.ui.programs;
  readonly count = this.ui.programCount;
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly offset = signal(0);
  readonly search = signal("");
  readonly rangeEnd = computed(() => this.offset() + this.programs().length);

  initializationMainPrograms(): void {
    this.navService.setNavTitle("Программы");
    const query$ = this.route.queryParamMap.pipe(
      map(params => {
        const raw = Number(params.get("offset") ?? 0);
        return {
          offset: Number.isSafeInteger(raw) && raw >= 0 ? raw : 0,
          search: (params.get("search") ?? "").trim().slice(0, 255),
          participating: params.get("participating") === "true",
        };
      }),
      distinctUntilChanged(
        (a, b) =>
          a.offset === b.offset && a.search === b.search && a.participating === b.participating,
      ),
    );
    combineLatest([query$, this.refresh])
      .pipe(
        switchMap(([query]) => {
          this.offset.set(query.offset);
          this.search.set(query.search);
          this.isPparticipating.set(query.participating);
          this.loading.set(true);
          this.error.set(false);
          this.ui.applyPrograms([], 0);
          let params = new HttpParams();
          if (query.participating) params = params.set("participating", "true");
          if (query.search) params = params.set("search", query.search);
          return this.api.execute(params, query.offset, this.pageSize);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.loading.set(false);
        if (!result.ok) {
          this.error.set(true);
          return;
        }
        this.ui.applyPrograms(result.value.results, result.value.count);
      });
  }

  onTogglePparticipating(): void {
    void this.router.navigate([], {
      queryParams: { participating: this.isPparticipating() ? null : "true", offset: null },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  page(delta: number): void {
    void this.router.navigate([], {
      queryParams: { offset: Math.max(0, this.offset() + delta * this.pageSize) || null },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  reload(): void {
    this.refresh.next(this.refresh.value + 1);
  }
}
