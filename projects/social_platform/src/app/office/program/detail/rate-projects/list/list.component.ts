/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
import { RatingCardComponent } from "@office/program/shared/rating-card/rating-card.component";
import { ProjectRate } from "@office/program/models/project-rate";
import { ProjectRatingService } from "@office/program/services/project-rating.service";

/**
 * Компонент списка проектов для оценки
 *
 * Отображает проекты программы в формате карточек для экспертной оценки.
 * Поддерживает фильтрацию, поиск и бесконечную прокрутку.
 *
 * Принимает:
 * @param {ActivatedRoute} route - Для получения данных и query параметров
 * @param {Router} router - Для определения текущего URL
 * @param {ProjectRatingService} projectRatingService - Сервис оценки проектов
 *
 * Состояние (signals):
 * @property {Signal<ProjectRate[]>} projects - Массив проектов для оценки
 * @property {Signal<number>} currentIndex - Индекс текущего проекта
 * @property {Signal<number>} totalProjCount - Общее количество проектов
 * @property {Signal<number>} fetchLimit - Лимит загрузки (8 проектов)
 * @property {Signal<number>} fetchPage - Текущая страница
 * @property {Signal<boolean | undefined>} isRatedByExpert - Фильтр по статусу оценки
 * @property {Signal<string>} searchValue - Поисковый запрос
 *
 * Фильтрация и поиск:
 * - Реагирует на изменения query параметров
 * - Поддерживает фильтр по статусу оценки экспертом
 * - Поиск по названию проекта
 * - Автоматическое обновление списка при изменении фильтров
 *
 * Пагинация:
 * - Бесконечная прокрутка для подгрузки проектов
 * - Throttling для предотвращения избыточных запросов
 * - Отслеживание позиции прокрутки
 *
 * Навигация между проектами:
 * @method toggleProject(type: "next" | "prev") - Переключение между проектами
 *
 * Методы загрузки:
 * @method onScroll() - Обработчик прокрутки для подгрузки
 * @method onFetch(offset, limit) - Загрузка проектов с фильтрами
 *
 * Жизненный цикл:
 * - OnInit: Загрузка начальных данных и настройка подписок
 * - AfterViewInit: Настройка обработчика прокрутки
 * - OnDestroy: Очистка подписок
 *
 * Возвращает:
 * HTML шаблон с карточками проектов для оценки
 */
@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  standalone: true,
  imports: [RatingCardComponent],
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly projectRatingService: ProjectRatingService
  ) {}

  isListOfAll = this.router.url.includes("/all");
  isRatedByExpert = signal<boolean | undefined>(undefined);
  searchValue = signal<string>("");

  projects = signal<ProjectRate[]>([]);
  initialProjects: ProjectRate[] = [];
  currentIndex = signal(0);

  totalProjCount = signal(0);
  fetchLimit = signal(8);
  fetchPage = signal(0);

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    const initProjects$ = this.route.data
      .pipe(
        map(r => r["data"]),
        map(r => ({ projects: r["results"], count: r["count"] }))
      )
      .subscribe(({ projects, count }) => {
        this.initialProjects = projects;
        this.projects.set(projects);
        this.totalProjCount.set(count);
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
        switchMap(() => this.onFetch(this.fetchPage() * this.fetchLimit(), this.fetchLimit()))
      )
      .subscribe(result => {
        this.projects.set(result.results);
      });

    this.subscriptions$().push(initProjects$, queryParams$);
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

      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  toggleProject(type: "next" | "prev"): void {
    if (this.currentIndex() >= 0) {
      if (type === "prev") {
        this.currentIndex.update(() => this.currentIndex() - 1);
      } else this.currentIndex.update(() => this.currentIndex() + 1);
    }
  }

  onScroll() {
    if (this.projects().length >= this.totalProjCount()) {
      return of({});
    }

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom > 0) return of({});

    this.fetchPage.update(p => p + 1);

    return this.onFetch(this.fetchPage() * this.fetchLimit(), this.fetchLimit());
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
        this.totalProjCount.set(count);
        this.projects.set(results);
      })
    );
  }
}
