/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router";
import {
  combineLatest,
  concatMap,
  distinctUntilChanged,
  map,
  of,
  Subscription,
  switchMap,
} from "rxjs";
import { NavService } from "@ui/services/nav/nav.service";
import Fuse from "fuse.js";
import { CheckboxComponent, SelectComponent } from "@ui/components";
import { generateOptionsList } from "@utils/generate-options-list";
import { ClickOutsideModule } from "ng-click-outside";
import { ProgramCardComponent } from "../../../shared/program-card/program-card.component";
import { HttpParams } from "@angular/common/http";
import { ProgramService } from "projects/social_platform/src/app/api/program/program.service";
import { Program } from "projects/social_platform/src/app/domain/program/program.model";

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
  imports: [
    RouterLink,
    ProgramCardComponent,
    CheckboxComponent,
    SelectComponent,
    ClickOutsideModule,
  ],
})
export class ProgramMainComponent implements OnInit, OnDestroy {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly programService = inject(ProgramService);
  private readonly cdref = inject(ChangeDetectorRef);

  programCount = 0;

  programs: Program[] = [];
  searchedPrograms: Program[] = [];
  subscriptions$: Subscription[] = [];
  isPparticipating = signal<boolean>(false);

  readonly programOptionsFilter = generateOptionsList(4, "strings", [
    "все",
    "актуальные",
    "архив",
    "учавстсвовал",
  ]);

  ngOnInit(): void {
    this.navService.setNavTitle("Программы");

    const combined$ = combineLatest([
      this.route.queryParams.pipe(
        map(q => ({ filter: this.buildFilterQuery(q), search: q["search"] || "" })),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      ),
    ])
      .pipe(
        switchMap(([{ filter, search }]) => {
          this.isPparticipating.set(filter["participating"] === "true");

          return this.programService
            .getAll(0, 20, new HttpParams({ fromObject: filter }))
            .pipe(map(response => ({ response, search })));
        })
      )
      .subscribe(({ response, search }) => {
        this.programCount = response.count;
        this.programs = response.results ?? [];

        if (search) {
          const fuse = new Fuse(this.programs, {
            keys: ["name"],
            threshold: 0.3,
          });
          this.searchedPrograms = fuse.search(search).map(el => el.item);
        } else {
          this.searchedPrograms = this.programs;
        }

        this.cdref.detectChanges();
      });

    this.subscriptions$.push(combined$);
  }

  private buildFilterQuery(q: Params): Record<string, any> {
    const reqQuery: Record<string, any> = {};

    if (q["participating"]) {
      reqQuery["participating"] = q["participating"];
    }

    return reqQuery;
  }

  /**
   * Переключает состояние чекбокса "участвую"
   */
  onTogglePparticipating(): void {
    const newValue = !this.isPparticipating();
    this.isPparticipating.set(newValue);

    this.router.navigate([], {
      queryParams: {
        participating: newValue ? "true" : null,
      },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }
}
