/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { Subject, takeUntil } from "rxjs";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";

@Injectable()
export class ProgramInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly navService = inject(NavService);
  private readonly router = inject(Router);
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly searchForm = this.programMainUIInfoService.searchForm;

  initializationPrograms(): void {
    this.navService.setNavTitle("Программы");

    this.initilizationSearchValue();
  }

  private initilizationSearchValue(): void {
    this.searchForm
      .get("search")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { search },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => console.debug("QueryParams changed from ProjectsComponent"));
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
