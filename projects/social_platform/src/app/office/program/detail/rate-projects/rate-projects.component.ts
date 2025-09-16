/** @format */

import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  concatMap,
  debounceTime,
  fromEvent,
  map,
  of,
  Subscription,
  switchMap,
  tap,
  throttleTime,
} from "rxjs";
import { ProjectRate } from "@office/program/models/project-rate";
import { ProjectRatingService } from "@office/program/services/project-rating.service";
import { CommonModule } from "@angular/common";
import { RatingCardComponent } from "@office/program/shared/rating-card/rating-card.component";
import { CheckboxComponent, ButtonComponent, SelectComponent } from "@ui/components";
import { filterTags } from "projects/core/src/consts/filter-tags";
import { SearchComponent } from "@ui/components/search/search.component";

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RatingCardComponent,
    CheckboxComponent,
    SearchComponent,
  ],
})
export class RateProjectsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly projectRatingService: ProjectRatingService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder
  ) {
    const isRatedByExpert =
      this.route.snapshot.queryParams["is_rated_by_expert"] === "true"
        ? true
        : this.route.snapshot.queryParams["is_rated_by_expert"] === "false"
        ? false
        : null;

    const searchValue = this.route.snapshot.queryParams["name__contains"];
    const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";

    this.searchForm = this.fb.group({
      search: [decodedSearchValue],
    });

    this.filterForm = this.fb.group({
      filterTag: [isRatedByExpert, Validators.required],
    });
  }

  readonly ratingOptionsList = filterTags;

  searchForm: FormGroup;
  filterForm: FormGroup;

  subscriptions$: Subscription[] = [];
  programId?: number;

  isFilterOpen = false;

  isListOfAll = this.router.url.includes("/all");
  isRatedByExpert = signal<boolean | undefined>(undefined);
  searchValue = signal<string>("");

  projects: ProjectRate[] = [];
  initialProjects: ProjectRate[] = [];

  totalProjCount = 0;
  fetchLimit = 8;
  fetchPage = 0;

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");
    this.programId = this.route.snapshot.params["programId"];

    const initProjects$ = this.route.data
      .pipe(
        map(r => r["data"]),
        map(r => ({ projects: r["results"], count: r["count"] }))
      )
      .subscribe(({ projects, count }) => {
        this.initialProjects = projects;
        this.projects = projects;
        this.totalProjCount = count;
      });

    const queryParams$ = this.route.queryParams
      .pipe(
        debounceTime(200),
        tap(params => {
          const isRatedByExpert =
            params["is_rated_by_expert"] === "true"
              ? true
              : params["is_rated_by_expert"] === "false"
              ? false
              : undefined;
          const searchValue = params["name__contains"];

          this.isRatedByExpert.set(isRatedByExpert);
          this.searchValue.set(searchValue);
        }),
        switchMap(() => this.onFetch(this.fetchPage * this.fetchLimit, this.fetchLimit))
      )
      .subscribe((params: any) => {
        this.projects = params.results;
        const searchValue = params["name__contains"];
        this.searchForm.get("search")?.setValue(searchValue, { emitEvent: false });
      });

    this.subscriptions$.push(initProjects$, queryParams$);

    this.subscriptions$.push(queryParams$);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          debounceTime(200),
          concatMap(() => this.onScroll()),
          throttleTime(2000)
        )
        .subscribe();

      this.subscriptions$.push(scrollEvents$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  setValue(event: Event) {
    event.stopPropagation();
    this.filterForm.get("filterTag")?.setValue(!this.filterForm.get("filterTag")?.value);

    this.router.navigate([], {
      queryParams: { is_rated_by_expert: this.filterForm.get("filterTag")?.value },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
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

  onScroll() {
    if (this.projects.length >= this.totalProjCount) {
      return of({});
    }

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom > 0) return of({});

    this.fetchPage += 1;

    return this.onFetch(this.fetchPage * this.fetchLimit, this.fetchLimit);
  }

  onFetch(offset: number, limit: number) {
    const programId = this.route.parent?.snapshot.params["programId"];
    const observable = this.projectRatingService.getAll(
      programId,
      offset,
      limit,
      this.isRatedByExpert(),
      this.searchValue()
    );

    return observable.pipe(
      tap(({ count, results }) => {
        this.totalProjCount = count;
        this.projects = results;
      })
    );
  }
}
