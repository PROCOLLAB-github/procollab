/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  BehaviorSubject,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  noop,
  of,
  skip,
  Subscription,
  switchMap,
  take,
  tap,
  throttleTime,
} from "rxjs";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { containerSm } from "@utils/responsive";
import { MemberService } from "@services/member.service";
import { CommonModule } from "@angular/common";
import { SearchComponent } from "@ui/components/search/search.component";
import { MembersFiltersComponent } from "./filters/members-filters.component";
import { ApiPagination } from "@models/api-pagination.model";
import { InfoCardComponent } from "@office/features/info-card/info-card.component";

/**
 * Компонент для отображения списка участников с возможностью поиска и фильтрации
 *
 * Основные функции:
 * - Отображение списка участников в виде карточек
 * - Поиск участников по имени
 * - Фильтрация по навыкам, специальности, возрасту и принадлежности к МосПолитеху
 * - Бесконечная прокрутка для подгрузки дополнительных участников
 * - Синхронизация фильтров с URL параметрами
 *
 * @component MembersComponent
 */
@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrl: "./members.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SearchComponent,
    CommonModule,
    RouterLink,
    MembersFiltersComponent,
    InfoCardComponent,
  ],
})
export class MembersComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Конструктор компонента
   *
   * Инициализирует формы поиска и фильтрации:
   * - searchForm: форма для поиска по имени участника
   * - filterForm: форма для фильтрации по навыкам, специальности, возрасту и статусу студента
   *
   * @param route - Сервис для работы с активным маршрутом
   * @param router - Сервис для навигации
   * @param navService - Сервис для управления навигацией
   * @param fb - FormBuilder для создания реактивных форм
   * @param memberService - Сервис для работы с данными участников
   * @param cdref - ChangeDetectorRef для ручного запуска обнаружения изменений
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly navService: NavService,
    private readonly fb: FormBuilder,
    private readonly memberService: MemberService,
    private readonly cdref: ChangeDetectorRef,
    private readonly renderer: Renderer2
  ) {
    // Форма поиска с обязательным полем для ввода имени
    this.searchForm = this.fb.group({
      search: ["", [Validators.required]],
    });

    // Форма фильтрации с полями для различных критериев
    this.filterForm = this.fb.group({
      keySkill: ["", Validators.required], // Ключевой навык
      speciality: ["", Validators.required], // Специальность
      age: [[null, null]], // Диапазон возраста [от, до]
      isMosPolytechStudent: [false], // Является ли студентом МосПолитеха
    });
  }

  /**
   * Инициализация компонента
   *
   * Выполняет:
   * - Очистку URL параметров
   * - Установку заголовка навигации
   * - Загрузку начальных данных из резолвера
   * - Настройку подписок на изменения форм и URL параметров
   */
  ngOnInit(): void {
    // Очищаем URL параметры при инициализации
    this.router.navigate([], { queryParams: {} });

    // Устанавливаем заголовок страницы
    this.navService.setNavTitle("Участники");

    // Загружаем начальные данные участников из резолвера
    this.route.data
      .pipe(
        take(1),
        map(r => r["data"])
      )
      .subscribe((members: ApiPagination<User>) => {
        this.membersTotalCount = members.count;
        this.members = members.results;
      });

    // Настраиваем синхронизацию значений форм с URL параметрами
    this.saveControlValue(this.searchForm.get("search"), "fullname");
    this.saveControlValue(this.filterForm.get("keySkill"), "skills__contains");
    this.saveControlValue(this.filterForm.get("speciality"), "speciality__icontains");
    this.saveControlValue(this.filterForm.get("age"), "age");
    this.saveControlValue(this.filterForm.get("isMosPolytechStudent"), "is_mospolytech_student");

    // Подписываемся на изменения URL параметров для обновления списка участников
    this.route.queryParams
      .pipe(
        skip(1), // Пропускаем первое значение
        distinctUntilChanged(), // Игнорируем одинаковые значения
        debounceTime(100), // Задержка для предотвращения частых запросов
        switchMap(params => {
          // Формируем параметры для API запроса
          const fetchParams: Record<string, string> = {};

          if (params["fullname"]) fetchParams["fullname"] = params["fullname"];
          if (params["skills__contains"])
            fetchParams["skills__contains"] = params["skills__contains"];
          if (params["speciality__icontains"])
            fetchParams["speciality__icontains"] = params["speciality__icontains"];
          if (params["is_mospolytech_student"])
            fetchParams["is_mospolytech_student"] = params["is_mospolytech_student"];

          // Проверяем формат параметра возраста (должен быть "число,число")
          if (params["age"] && /\d+,\d+/.test(params["age"])) fetchParams["age"] = params["age"];

          this.searchParamsSubject$.next(fetchParams);
          return this.onFetch(0, 20, fetchParams);
        })
      )
      .subscribe(members => {
        this.members = members;
        this.membersPage = 1;
        this.cdref.detectChanges();
      });
  }

  /**
   * Инициализация после создания представления
   *
   * Настраивает обработчик события прокрутки для реализации бесконечной прокрутки
   */
  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500) // Ограничиваем частоту обработки прокрутки
        )
        .subscribe(noop);

      this.subscriptions$.push(scrollEvents$);
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  // Константы и свойства компонента
  containerSm = containerSm; // Брейкпоинт для мобильных устройств
  appWidth = window.innerWidth; // Ширина окна браузера

  @ViewChild("membersRoot") membersRoot?: ElementRef<HTMLUListElement>; // Ссылка на корневой элемент списка
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>; // Ссылка на элемент фильтра

  membersTotalCount?: number; // Общее количество участников
  membersPage = 1; // Текущая страница для пагинации
  membersTake = 20; // Количество участников на странице

  subscriptions$: Subscription[] = []; // Массив подписок для очистки

  members: User[] = []; // Массив участников для отображения

  searchParamsSubject$ = new BehaviorSubject<Record<string, string>>({}); // Subject для параметров поиска

  searchForm: FormGroup; // Форма поиска
  filterForm: FormGroup; // Форма фильтрации

  /**
   * Обработчик события прокрутки для бесконечной прокрутки
   *
   * @returns Observable с дополнительными участниками или пустой объект
   */
  onScroll() {
    // Проверяем, есть ли еще участники для загрузки
    if (this.membersTotalCount && this.members.length >= this.membersTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.membersRoot) return of({});

    // Вычисляем, достиг ли пользователь конца списка
    const diff =
      target.scrollTop -
      this.membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      // Загружаем следующую порцию участников
      return this.onFetch(
        this.membersPage * this.membersTake,
        this.membersTake,
        this.searchParamsSubject$.value
      ).pipe(
        tap(membersChunk => {
          this.membersPage++;
          this.members = [...this.members, ...membersChunk];
          this.cdref.detectChanges();
        })
      );
    }

    return of({});
  }

  /**
   * Сохраняет значение элемента формы в URL параметрах
   *
   * @param control - Элемент управления формы
   * @param queryName - Имя параметра в URL
   */
  saveControlValue(control: AbstractControl | null, queryName: string): void {
    if (!control) return;

    const sub$ = control.valueChanges.subscribe(value => {
      this.router
        .navigate([], {
          queryParams: { [queryName]: value.toString() },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from MembersComponent"));
    });

    this.subscriptions$.push(sub$);
  }

  /**
   * Выполняет запрос на получение участников с заданными параметрами
   *
   * @param skip - Количество записей для пропуска (для пагинации)
   * @param take - Количество записей для получения
   * @param params - Дополнительные параметры фильтрации
   * @returns Observable<User[]> - Массив участников
   */
  onFetch(skip: number, take: number, params?: Record<string, string | number | boolean>) {
    return this.memberService.getMembers(skip, take, params).pipe(
      map((members: ApiPagination<User>) => {
        this.membersTotalCount = members.count;
        return members.results;
      })
    );
  }
}
