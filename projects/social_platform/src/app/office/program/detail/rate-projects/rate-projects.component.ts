/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { BarComponent } from "@ui/components";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

/**
 * Компонент страницы оценки проектов программы
 *
 * Основной компонент для экспертной оценки проектов в рамках программы.
 * Предоставляет интерфейс поиска и фильтрации проектов для оценки.
 *
 * Функциональность:
 * - Поиск проектов по названию
 * - Навигационная панель
 * - Router outlet для дочерних компонентов (список проектов)
 * - Обработка URL параметров поиска
 *
 * Принимает:
 * @param {NavService} navService - Сервис навигации для установки заголовка
 * @param {Router} router - Для навигации и изменения URL параметров
 * @param {ActivatedRoute} route - Для получения параметров маршрута
 * @param {FormBuilder} fb - Для создания реактивных форм
 *
 * Формы:
 * @property {FormGroup} searchForm - Форма поиска проектов
 *
 * Состояние:
 * @property {number} programId - ID текущей программы
 * @property {boolean} isOpen - Состояние открытия фильтров
 * @property {Subscription[]} subscriptions$ - Массив подписок для очистки
 *
 * Методы:
 * @method onSearchClick() - Обработчик поиска, обновляет URL параметры
 * @method onClickOutside() - Закрывает выпадающие меню при клике вне
 *
 * Возвращает:
 * HTML шаблон с поиском и router-outlet для списка проектов
 */
@Component({
  selector: "app-rate-projects",
  templateUrl: "./rate-projects.component.html",
  styleUrl: "./rate-projects.component.scss",
  standalone: true,
  imports: [BarComponent, RouterOutlet, ReactiveFormsModule],
})
export class RateProjectsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder
  ) {
    // const isRatedByExpert =
    //   this.route.snapshot.queryParams["is_rated_by_expert"] === "true"
    //     ? true
    //     : this.route.snapshot.queryParams["is_rated_by_expert"] === "false"
    //     ? false
    //     : null;

    const searchValue = this.route.snapshot.queryParams["name__contains"];
    const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";

    this.searchForm = this.fb.group({
      search: [decodedSearchValue],
    });

    // this.filterForm = this.fb.group({
    //   filterTag: [isRatedByExpert, Validators.required],
    // });
  }

  searchForm: FormGroup;
  // filterForm: FormGroup;

  subscriptions$: Subscription[] = [];
  programId?: number;

  isOpen = false;
  // readonly filterTags = filterTags;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");
    this.programId = this.route.snapshot.params["programId"];

    const queryParams$ = this.route.queryParams.subscribe(params => {
      const searchValue = params["name__contains"];
      this.searchForm.get("search")?.setValue(searchValue, { emitEvent: false });
    });

    this.subscriptions$.push(queryParams$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  // setValue(event: Event, tag: boolean | null) {
  //   event.stopPropagation();
  //   this.filterForm.get("filterTag")?.setValue(tag);
  //   this.isOpen = false;

  //   this.router.navigate([], {
  //     queryParams: { is_rated_by_expert: tag },
  //     relativeTo: this.route,
  //     queryParamsHandling: "merge",
  //   });
  // }

  // toggleOpen(event: Event) {
  //   event.stopPropagation();
  //   this.isOpen = !this.isOpen;
  // }

  onClickOutside() {
    this.isOpen = false;
  }

  onSearchClick() {
    const searchValue = this.searchForm.get("search")?.value;

    this.router.navigate([], {
      queryParams: { name__contains: searchValue },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });

    this.searchForm.get("search")?.reset();
  }
}
