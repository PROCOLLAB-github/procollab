/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, filter, map } from "rxjs";

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
    const searchControl = this.searchForm.controls.search;
    this.route.queryParamMap
      .pipe(
        map(params => (params.get("search") ?? "").slice(0, 255)),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(search => {
        if (searchControl.value !== search) searchControl.setValue(search, { emitEvent: false });
      });
    searchControl.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => !this.router.url.split("?")[0].endsWith("/managed")),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { search: search?.trim() || null, offset: null },
            relativeTo: this.route,
            queryParamsHandling: "merge",
            replaceUrl: true,
          })
          .then(() => this.loggerService.debug("Обновлены параметры поиска программ"));
      });
  }
}
