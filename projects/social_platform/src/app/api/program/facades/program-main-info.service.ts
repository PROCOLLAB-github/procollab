/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { combineLatest, distinctUntilChanged, map, Subject, switchMap, takeUntil } from "rxjs";
import { ProgramService } from "../program.service";
import { Program } from "../../../domain/program/program.model";
import { HttpParams } from "@angular/common/http";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import Fuse from "fuse.js";

@Injectable()
export class ProgramMainInfoService {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly programService = inject(ProgramService);
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);

  private readonly destroy$ = new Subject<void>();

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

          return this.programService
            .getAll(0, 20, new HttpParams({ fromObject: filter }))
            .pipe(map(response => ({ response, search })));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(({ response, search }) => {
        const programs = this.applySearch(response, search);

        this.programMainUIInfoService.applyPrograms(programs, response.count);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Переключает состояние чекбокса "участвую"
   */
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
