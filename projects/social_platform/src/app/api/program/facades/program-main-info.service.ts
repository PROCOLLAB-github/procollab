/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { combineLatest, distinctUntilChanged, map, switchMap } from "rxjs";
import { Program } from "@domain/program/program.model";
import { HttpParams } from "@angular/common/http";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProgramShellInfoService } from "./program-shell-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import Fuse from "fuse.js";

/** Фасад главной вкладки программы: участие в программе (`ParticipatingProgramUseCase`). */
@Injectable()
export class ProgramMainInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navService = inject(NavService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);
  private readonly programShellInfoService = inject(ProgramShellInfoService);

  readonly isPparticipating = this.programMainUIInfoService.isPparticipating;

  readonly programs = this.programMainUIInfoService.programs;

  initializationMainPrograms(): void {
    this.navService.setNavTitle("Программы");

    combineLatest([
      this.route.queryParams.pipe(
        map(q => ({ filter: this.buildFilterQuery(q), search: q["search"] || "" })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      ),
    ])
      .pipe(
        switchMap(([{ filter, search }]) => {
          this.isPparticipating.set(filter["participating"] === "true");

          return this.programShellInfoService
            .ensureProgramsLoaded(new HttpParams({ fromObject: filter }))
            .pipe(map(result => ({ result, search })));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ result, search }) => {
        if (!result.ok) {
          return;
        }

        const programs = this.applySearch(result.value, search);

        this.programMainUIInfoService.applyPrograms(programs, result.value.count);
      });
  }

  onTogglePparticipating(): void {
    const newValue = !this.isPparticipating();
    this.isPparticipating.set(newValue);

    this.router.navigate([], {
      queryParams: {
        participating: newValue ? "true" : null,
      },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  private buildFilterQuery(q: Params): Record<string, any> {
    const reqQuery: Record<string, any> = {};

    if (q["participating"]) {
      reqQuery["participating"] = q["participating"];
    }

    return reqQuery;
  }

  private applySearch(response: ApiPagination<Program>, search: string): Program[] {
    if (!search) return response.results;

    const fuse = new Fuse(response.results, { keys: ["name"], threshold: 0.3 });
    return fuse.search(search).map(r => r.item);
  }
}
