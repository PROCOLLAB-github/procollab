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

/**
 * КОМПОНЕНТ ФИЛЬТРАЦИИ ЛЕНТЫ
 *
 * Предоставляет интерфейс для фильтрации элементов ленты по типам контента.
 * Позволяет пользователю выбирать, какие типы элементов отображать в ленте.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Отображение выпадающего меню с опциями фильтрации
 * - Управление состоянием активных фильтров
 * - Синхронизация фильтров с URL параметрами
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
    this.route.queryParams.subscribe(params => {
      params["includes"] &&
        this.includedFilters.set(params["includes"].split(this.feedService.FILTER_SPLIT_SYMBOL));
    });

    this.subscriptions.push(profileSubscription);
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
  filterOptions = [
    { label: "Новости", value: "news" },
    { label: "Вакансии", value: "vacancy" },
    { label: "Новости проектов", value: "project" },
  ];

  // Массив активных фильтров
  includedFilters = signal<string[]>([]);

  /**
   * ПРИМЕНЕНИЕ ФИЛЬТРОВ
   *
   * ЧТО ДЕЛАЕТ:
   * - Обновляет URL параметры с выбранными фильтрами
   * - Инициирует перезагрузку ленты с новыми фильтрами
   * - Сохраняет другие параметры запроса
   */
  applyFilter(): void {
    this.router
      .navigate([], {
        queryParams: {
          includes: this.includedFilters().join(this.feedService.FILTER_SPLIT_SYMBOL),
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from FeedFilterComponent"));
  }

  /**
   * ПЕРЕКЛЮЧЕНИЕ ФИЛЬТРА
   *
   * ЧТО ПРИНИМАЕТ:
   * @param keyword - значение фильтра для переключения
   *
   * ЧТО ДЕЛАЕТ:
   * - Добавляет фильтр, если он не активен
   * - Удаляет фильтр, если он уже активен
   * - Обновляет состояние активных фильтров
   */
  setFilter(keyword: string): void {
    this.includedFilters.update(included => {
      if (included.indexOf(keyword) !== -1) {
        // Удаляем фильтр, если он уже активен
        const idx = included.indexOf(keyword);
        included.splice(idx, 1);
      } else {
        // Добавляем новый фильтр
        included.push(keyword);
      }

      return included;
    });
  }

  /**
   * СБРОС ВСЕХ ФИЛЬТРОВ
   *
   * ЧТО ДЕЛАЕТ:
   * - Очищает все активные фильтры
   * - Применяет пустой набор фильтров
   * - Возвращает ленту к состоянию по умолчанию
   */
  resetFilter(): void {
    this.includedFilters.set([]);
    this.applyFilter();
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
