/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, Subscription } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { ProgramCardComponent } from "../../shared/program-card/program-card.component";
import { NavService } from "@office/services/nav.service";
import Fuse from "fuse.js";

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
  standalone: true,
  imports: [RouterLink, ProgramCardComponent],
})
export class ProgramMainComponent implements OnInit, OnDestroy {
  constructor(private readonly route: ActivatedRoute, private readonly navService: NavService) {}

  programCount = 0;

  programs: Program[] = [];
  searchedPrograms: Program[] = [];
  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    this.navService.setNavTitle("Программы");

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.programs, {
        keys: ["name"],
      });

      this.searchedPrograms = search ? fuse.search(search).map(el => el.item) : this.programs;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);

    const programs$ = this.route.data.pipe(map(r => r["data"])).subscribe(programs => {
      this.programCount = programs.count;
      this.programs = programs.results ?? [];
      this.searchedPrograms = programs.results ?? [];
    });

    programs$ && this.subscriptions$.push(programs$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }
}
