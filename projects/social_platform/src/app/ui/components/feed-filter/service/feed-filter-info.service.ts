/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DetailProfileInfoService } from "@ui/components/detail/services/profile/detail-profile-info.service";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { Subject, takeUntil } from "rxjs";

@Injectable()
export class FeedFilterInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly detailProfileInfoService = inject(DetailProfileInfoService);

  private readonly destroy$ = new Subject<void>();

  // Состояние выпадающего меню фильтров
  readonly filterOpen = signal(false);

  // Массив активных фильтров
  readonly includedFilters = signal<string>("");

  initializationFeedFilter(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.detailProfileInfoService.applySetProfile(profile);
    });

    this.route.queryParams.subscribe(queries => {
      if (queries["includes"]) {
        this.includedFilters.set(queries["includes"]);
      } else {
        this.includedFilters.set("");
      }
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ПЕРЕКЛЮЧЕНИЕ ФИЛЬТРА С МГНОВЕННЫМ ОБНОВЛЕНИЕМ URL
   *
   * ЧТО ПРИНИМАЕТ:
   * @param id - id для фильтра
   * @param keyword - значение фильтра для переключения
   *
   * ЧТО ДЕЛАЕТ:
   * - Добавляет фильтр, если он не активен
   * - Удаляет фильтр, если он уже активен
   * - Обрабатывает переключение между projects и projects/1
   * - Мгновенно обновляет URL параметры
   */
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

  /**
   * СБРОС ВСЕХ ФИЛЬТРОВ
   *
   * ЧТО ДЕЛАЕТ:
   * - Очищает все активные фильтры
   * - Мгновенно обновляет URL
   * - Возвращает ленту к состоянию по умолчанию
   */
  resetFilter(): void {
    this.includedFilters.set("");
    this.updateUrl();
  }

  /**
   * ЗАКРЫТИЕ ВЫПАДАЮЩЕГО МЕНЮ
   *
   * ЧТО ДЕЛАЕТ:
   * - Закрывает выпадающее меню при клике вне его области
   * - Используется директивой ClickOutside
   */
  onClickOutside(): void {
    this.filterOpen.set(false);
  }

  /**
   * ОБНОВЛЕНИЕ URL С ТЕКУЩИМИ ФИЛЬТРАМИ
   *
   * Приватный метод для обновления URL параметров.
   * Вызывается автоматически при любом изменении фильтров.
   */
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
      .then(() => console.debug("Query change from FeedFilterComponent"));
  }
}
