/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { getFeedFilter } from "@core/consts/filters/feed-filter.const";

@Injectable()
export class FeedFilterInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  // Состояние выпадающего меню фильтров
  readonly filterOpen = signal(false);

  // Активная категория ленты
  readonly includedFilters = signal<string>("");

  initializationFeedFilter(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queries => {
      this.includedFilters.set(getFeedFilter(queries["includes"]).value);
    });
  }

  /** Выбирает категорию и обновляет URL. */
  setFilter(keyword: string): void {
    this.includedFilters.set(keyword);
    this.filterOpen.set(false);
    this.updateUrl();
  }

  /** Сбрасывает все фильтры. */
  resetFilter(): void {
    this.setFilter("");
  }

  /** Закрывает выпадающее меню (ClickOutside). */
  onClickOutside(): void {
    this.filterOpen.set(false);
  }

  private updateUrl(): void {
    const includesParam = this.includedFilters().length > 0 ? this.includedFilters() : null;

    this.router
      .navigate([], {
        queryParams: {
          includes: includesParam,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from FeedFilterComponent"));
  }
}
