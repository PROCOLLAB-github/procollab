/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { FeedService } from "@office/feed/services/feed.service";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Subscription } from "rxjs";
import { feedFilter } from "projects/core/src/consts/filters/feed-filter.const";

/**
 * КОМПОНЕНТ ФИЛЬТРАЦИИ ЛЕНТЫ
 *
 * Предоставляет интерфейс для фильтрации элементов ленты по типам контента.
 * Позволяет пользователю выбирать, какие типы элементов отображать в ленте.
 * Обновления URL происходят мгновенно при каждом изменении фильтра.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Отображение выпадающего меню с опциями фильтрации
 * - Управление состоянием активных фильтров
 * - Мгновенная синхронизация фильтров с URL параметрами
 * - Применение и сброс фильтров
 *
 * ДОСТУПНЫЕ ФИЛЬТРЫ:
 * - Новости (news)
 * - Вакансии (vacancy)
 * - Новости проектов (project)
 */
@Component({
  selector: "app-feed-filter",
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent,
    ButtonComponent,
    ClickOutsideModule,
    IconComponent,
    RouterLink,
  ],
  templateUrl: "./feed-filter.component.html",
  styleUrl: "./feed-filter.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("dropdownAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scaleY(0.8)" }),
        animate(".12s cubic-bezier(0, 0, 0.2, 1)"),
      ]),
      transition(":leave", [animate(".1s linear", style({ opacity: 0 }))]),
    ]),
  ],
})
export class FeedFilterComponent implements OnInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  feedService = inject(FeedService);

  profile = signal<User | null>(null);
  subscriptions: Subscription[] = [];

  /**
   * ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТА
   *
   * ЧТО ДЕЛАЕТ:
   * - Подписывается на изменения профиля пользователя
   * - Читает текущие фильтры из URL параметров
   * - Инициализирует состояние фильтров
   */
  ngOnInit() {
    const profileSubscription = this.authService.profile.subscribe(profile => {
      this.profile.set(profile);
    });

    // Читаем активные фильтры из URL
    const routeSubscription = this.route.queryParams.subscribe(queries => {
      if (queries["includes"]) {
        this.includedFilters.set(queries["includes"]);
      } else {
        this.includedFilters.set("");
      }
    });

    this.subscriptions.push(profileSubscription, routeSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  // Состояние выпадающего меню фильтров
  filterOpen = signal(false);

  /**
   * ОПЦИИ ФИЛЬТРАЦИИ
   *
   * Массив доступных опций для фильтрации ленты:
   * - label: отображаемое название на русском языке
   * - value: значение для API запроса
   */
  readonly feedFilterOptions = feedFilter;

  // Массив активных фильтров
  includedFilters = signal<string>("");

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
}
