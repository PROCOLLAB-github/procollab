/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад программы: загрузка/очистка данных программы. */
@Injectable()
export class ProgramInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navService = inject(NavService);
  private readonly loggerService = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);

  private readonly searchForm = this.programMainUIInfoService.searchForm;

  initializationPrograms(): void {
    this.navService.setNavTitle("Программы");

    this.initilizationSearchValue();
  }

  private initilizationSearchValue(): void {
    this.searchForm
      .get("search")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { search },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => this.loggerService.debug("QueryParams changed from ProjectsComponent"));
      });
  }
}
