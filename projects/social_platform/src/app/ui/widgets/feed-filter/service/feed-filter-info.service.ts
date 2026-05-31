/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable()
export class FeedFilterInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  // Состояние выпадающего меню фильтров
  readonly filterOpen = signal(false);

  // Массив активных фильтров
  readonly includedFilters = signal<string>("");

  initializationFeedFilter(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queries => {
      if (queries["includes"]) {
        this.includedFilters.set(queries["includes"]);
      } else {
        this.includedFilters.set("");
      }
    });
  }

  /** Переключает фильтр (добавляет/удаляет) с мгновенным обновлением URL. */
  setFilter(keyword: string): void {
    this.includedFilters.update(included => {
      if (keyword.startsWith("project/")) {
        // Если уже активен этот же вложенный фильтр - сбрасываем к "projects"
        if (included === keyword) {
          return "project";
        }
        return keyword;
      }

      // Если кликнули на "projects"
      if (keyword === "project") {
        if (included.startsWith("project/")) {
          return "project";
        }

        if (included === "project") {
          return "";
        }

        return "project";
      }

      if (included === keyword) {
        return "";
      }
      return keyword;
    });

    // Мгновенно обновляем URL
    this.updateUrl();
  }

  /** Сбрасывает все фильтры. */
  resetFilter(): void {
    this.includedFilters.set("");
    this.updateUrl();
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
