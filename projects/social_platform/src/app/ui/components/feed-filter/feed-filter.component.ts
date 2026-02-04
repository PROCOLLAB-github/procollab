/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { feedFilter } from "projects/core/src/consts/filters/feed-filter.const";
import { FeedFilterInfoService } from "./service/feed-filter-info.service";
import { DetailProfileInfoService } from "../detail/services/profile/detail-profile-info.service";
import { ProfileDetailUIInfoService } from "../../../api/profile/facades/detail/ui/profile-detail-ui-info.service";

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
  imports: [CommonModule, ClickOutsideModule, IconComponent],
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
  providers: [FeedFilterInfoService, ProfileDetailUIInfoService, DetailProfileInfoService],
})
export class FeedFilterComponent implements OnInit, OnDestroy {
  private readonly feedFilterInfoService = inject(FeedFilterInfoService);

  // Состояние выпадающего меню фильтров
  protected readonly filterOpen = this.feedFilterInfoService.filterOpen;

  // Массив активных фильтров
  protected readonly includedFilters = this.feedFilterInfoService.includedFilters;

  /**
   * ОПЦИИ ФИЛЬТРАЦИИ
   *
   * Массив доступных опций для фильтрации ленты:
   * - label: отображаемое название на русском языке
   * - value: значение для API запроса
   */
  protected readonly feedFilterOptions = feedFilter;

  /**
   * ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТА
   *
   * ЧТО ДЕЛАЕТ:
   * - Подписывается на изменения профиля пользователя
   * - Читает текущие фильтры из URL параметров
   * - Инициализирует состояние фильтров
   */
  ngOnInit() {
    this.feedFilterInfoService.initializationFeedFilter();
  }

  ngOnDestroy(): void {
    this.feedFilterInfoService.destroy();
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
    this.feedFilterInfoService.setFilter(keyword);
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
    this.feedFilterInfoService.resetFilter();
  }

  /**
   * ЗАКРЫТИЕ ВЫПАДАЮЩЕГО МЕНЮ
   *
   * ЧТО ДЕЛАЕТ:
   * - Закрывает выпадающее меню при клике вне его области
   * - Используется директивой ClickOutside
   */
  onClickOutside(): void {
    this.feedFilterInfoService.onClickOutside();
  }
}
