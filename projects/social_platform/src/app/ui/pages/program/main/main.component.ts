/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router";
import { combineLatest, distinctUntilChanged, map, Subscription, switchMap } from "rxjs";
import { NavService } from "@ui/services/nav/nav.service";
import Fuse from "fuse.js";
import { CheckboxComponent, SelectComponent } from "@ui/components";
import { generateOptionsList } from "@utils/generate-options-list";
import { ClickOutsideModule } from "ng-click-outside";
import { ProgramCardComponent } from "../../../shared/program-card/program-card.component";
import { HttpParams } from "@angular/common/http";
import { ProgramService } from "projects/social_platform/src/app/api/program/program.service";
import { Program } from "projects/social_platform/src/app/domain/program/program.model";
import { ProgramMainUIInfoService } from "projects/social_platform/src/app/api/program/facades/ui/program-main-ui-info.service";
import { ProgramMainInfoService } from "projects/social_platform/src/app/api/program/facades/program-main-info.service";

/**
 * Главный компонент списка программ
 *
 * Отображает список всех доступных программ с функциональностью поиска.
 * Поддерживает фильтрацию программ по названию в реальном времени.
 *
 * Принимает:
 * @param {ActivatedRoute} route - Для получения данных из резолвера и query параметров
 * @param {NavService} navService - Для установки заголовка навигации
 *
 * Данные:
 * @property {Program[]} programs - Полный массив программ
 * @property {Program[]} searchedPrograms - Отфильтрованный массив программ
 * @property {number} programCount - Общее количество программ
 *
 * Поиск:
 * - Использует библиотеку Fuse.js для нечеткого поиска
 * - Поиск происходит по полю "name" программы
 * - Реагирует на изменения query параметра "search"
 * - Обновляет searchedPrograms при изменении поискового запроса
 *
 * Жизненный цикл:
 * - OnInit:
 *   - Устанавливает заголовок "Программы"
 *   - Подписывается на изменения query параметров для поиска
 *   - Загружает данные из резолвера
 * - OnDestroy: Отписывается от всех подписок
 *
 * Подписки:
 * @property {Subscription[]} subscriptions$ - Массив подписок для очистки
 *
 * Возвращает:
 * HTML шаблон со списком карточек программ и результатами поиска
 */
@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [
    RouterLink,
    ProgramCardComponent,
    CheckboxComponent,
    SelectComponent,
    ClickOutsideModule,
  ],
  providers: [ProgramMainInfoService, ProgramMainUIInfoService],
  standalone: true,
})
export class ProgramMainComponent implements OnInit, OnDestroy {
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);
  private readonly programMainInfoService = inject(ProgramMainInfoService);

  protected readonly programs = this.programMainUIInfoService.programs;
  protected readonly isPparticipating = this.programMainUIInfoService.isPparticipating;
  protected readonly programOptionsFilter = this.programMainUIInfoService.programOptionsFilter;

  ngOnInit(): void {
    this.programMainInfoService.initializationMainPrograms();
  }

  /**
   * Переключает состояние чекбокса "участвую"
   */
  onTogglePparticipating(): void {
    this.programMainInfoService.onTogglePparticipating();
  }

  ngOnDestroy(): void {
    this.programMainInfoService.destroy();
  }
}
