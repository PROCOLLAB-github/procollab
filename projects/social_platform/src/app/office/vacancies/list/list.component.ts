/** @format */

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  noop,
  of,
  Subscription,
  switchMap,
  tap,
  throttleTime,
} from "rxjs";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { VacancyService } from "@office/services/vacancy.service";
import { Vacancy } from "@office/models/vacancy.model";
import { ApiPagination } from "@office/models/api-pagination.model";
import { ActivatedRoute, Router } from "@angular/router";
import { VacancyFilterComponent } from "../shared/filter/vacancy-filter.component";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { ResponseCardComponent } from "@office/shared/response-card/response-card.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";

/**
 * Компонент списка вакансий
 * Отображает список всех вакансий или откликов пользователя с возможностью фильтрации и поиска
 * Поддерживает бесконечную прокрутку для загрузки дополнительных данных
 */
@Component({
  selector: "app-vacancies-list",
  standalone: true,
  imports: [
    CommonModule,
    OpenVacancyComponent,
    VacancyFilterComponent,
    ResponseCardComponent,
    SearchComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class VacanciesListComponent {
  /** Сервис для работы с маршрутами */
  route = inject(ActivatedRoute);
  /** Сервис роутера для навигации */
  router = inject(Router);
  /** Сервис для работы с вакансиями */
  vacancyService = inject(VacancyService);

  /**
   * Конструктор компонента
   * @param fb - FormBuilder для создания формы поиска
   */
  constructor(private readonly fb: FormBuilder) {
    // Создание формы поиска
    this.searchForm = this.fb.group({
      search: [""], // Поле для поискового запроса
    });
  }

  /**
   * Инициализация компонента
   * Определяет тип страницы (все вакансии или мои отклики)
   * Настраивает подписки на изменения формы поиска и параметров маршрута
   */
  ngOnInit() {
    // Определение типа страницы из URL
    const urlSegment = this.router.url.split("/").slice(-1)[0];
    const trimmedSegment = urlSegment.split("?")[0];
    this.type.set(trimmedSegment as "all" | "my");

    // Подписка на изменения поля поиска с задержкой
    this.searchForm
      .get("search")
      ?.valueChanges.pipe(
        debounceTime(300), // Задержка 300мс перед выполнением поиска
        distinctUntilChanged(), // Выполнять только при изменении значения
        tap(value => {
          // Обновление параметров маршрута
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { role_contains: value || null },
            queryParamsHandling: "merge",
          });
        })
      )
      .subscribe();

    // Получение данных из резолвера маршрута
    const routeData$ =
      this.type() === "all"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    // Подписка на данные маршрута
    const subscription = routeData$.subscribe(
      (vacancy: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>) => {
        if (this.type() === "all") {
          this.vacancyList.set(vacancy.results as Vacancy[]);
        } else if (this.type() === "my") {
          this.responsesList.set(vacancy.results as VacancyResponse[]);
        }
        this.totalItemsCount.set(vacancy.count);
      }
    );

    // Подписка на изменения параметров запроса для фильтрации
    const queryParams$ = this.route.queryParams
      .pipe(
        debounceTime(200), // Задержка для избежания частых запросов
        tap(params => {
          // Извлечение параметров фильтрации из URL
          const requiredExperience = params["required_experience"]
            ? params["required_experience"]
            : undefined;

          // Установка значения поиска без вызова события
          this.searchForm
            .get("search")
            ?.setValue(params["role_contains"] || "", { emitEvent: false });

          const workFormat = params["work_format"] ? params["work_format"] : undefined;
          const workSchedule = params["work_schedule"] ? params["work_schedule"] : undefined;
          const salaryMax = params["salary_max"] ? params["salary_max"] : undefined;
          const salaryMin = params["salary_min"] ? params["salary_min"] : undefined;

          // Обновление сигналов фильтрации
          this.requiredExperience.set(requiredExperience);
          this.workFormat.set(workFormat);
          this.workSchedule.set(workSchedule);
          this.salaryMin.set(salaryMin);
          this.salaryMax.set(salaryMax);
        }),
        switchMap(() => this.onFetch(0, 20)) // Загрузка данных с новыми фильтрами
      )
      .subscribe((result: any) => {
        this.vacancyList.set(result.results);
      });

    this.subscriptions$().push(subscription, queryParams$);
  }

  /**
   * Инициализация после отрисовки представления
   * Настраивает обработчик прокрутки для бесконечной загрузки
   */
  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      // Подписка на события прокрутки с троттлингом
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);

      this.subscriptions$().push(scrollEvents$);
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy() {
    this.subscriptions$().forEach(($: any) => $.unsubscribe());
  }

  /** Форма поиска */
  searchForm: FormGroup;
  /** Общее количество элементов */
  totalItemsCount = signal(0);
  /** Список вакансий */
  vacancyList = signal<Vacancy[]>([]);
  /** Список откликов */
  responsesList = signal<VacancyResponse[]>([]);
  /** Текущая страница */
  vacancyPage = signal(1);
  /** Количество элементов на страницу */
  perFetchTake = signal(20);
  /** Тип страницы: все вакансии или мои отклики */
  type = signal<"all" | "my" | null>(null);

  // Сигналы для фильтрации
  /** Фильтр по требуемому опыту */
  requiredExperience = signal<string | undefined>(undefined);
  /** Фильтр по формату работы */
  workFormat = signal<string | undefined>(undefined);
  /** Фильтр по графику работы */
  workSchedule = signal<string | undefined>(undefined);
  /** Минимальная зарплата */
  salaryMin = signal<string | undefined>(undefined);
  /** Максимальная зарплата */
  salaryMax = signal<string | undefined>(undefined);

  /** Массив подписок для очистки */
  subscriptions$ = signal<Subscription[]>([]);

  /**
   * Обработчик прокрутки для бесконечной загрузки
   * @returns Observable с дополнительными данными или пустой объект
   */
  onScroll() {
    // Проверка, есть ли еще данные для загрузки
    if (this.totalItemsCount() && this.vacancyList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    // Проверка позиции прокрутки
    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      // Загрузка следующей порции данных
      return this.onFetch(this.vacancyPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((vacancyChunk: Vacancy[]) => {
          this.vacancyPage.update(page => page + 1);
          this.vacancyList.update(items => [...items, ...vacancyChunk]);
        })
      );
    }

    return of({});
  }

  /**
   * Обработчик изменения значения поиска
   * @param event - новое значение поиска
   */
  onSearhValueChanged(event: string) {
    this.searchForm.get("search")?.setValue(event);
  }

  /**
   * Обработчик отправки формы поиска
   */
  onSearchSubmit() {
    const value = this.searchForm.get("search")?.value;
    this.router.navigate([], {
      queryParams: { role_contains: value || null },
      queryParamsHandling: "merge",
      relativeTo: this.route,
    });
  }

  /**
   * Загрузка данных с сервера
   * @param offset - смещение для пагинации
   * @param limit - количество элементов для загрузки
   * @returns Observable с данными вакансий
   */
  onFetch(offset: number, limit: number) {
    return this.vacancyService
      .getForProject(
        limit,
        offset,
        undefined,
        this.requiredExperience(),
        this.workFormat(),
        this.workSchedule(),
        this.salaryMin(),
        this.salaryMax(),
        this.searchForm.get("search")?.value
      )
      .pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.count);
          this.vacancyList.update(items => [...items, ...res.results]);
        }),
        map(res => res)
      );
  }
}
