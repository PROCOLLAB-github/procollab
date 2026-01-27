/** @format */

import { ElementRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  fromEvent,
  map,
  skip,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { MemberService } from "../member.service";
import { AuthService } from "../../auth";
import { User } from "../../../domain/auth/user.model";
import { AbstractControl } from "@angular/forms";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { MembersUIInfoService } from "./ui/members-ui-info.service";
import { NavigationService } from "../../paths/navigation.service";
import { ProjectsDetailUIInfoService } from "../../project/facades/detail/ui/projects-detail-ui.service";

@Injectable()
export class MembersInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navService = inject(NavService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly memberService = inject(MemberService);
  private readonly membersUIInfoService = inject(MembersUIInfoService);
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);

  private readonly searchParams = signal<Record<string, string>>({}); // Signal для параметров поиска

  private readonly membersTake = this.membersUIInfoService.membersTake; // Количество участников на странице
  private readonly members = this.membersUIInfoService.members; // Массив участников для отображения
  private readonly profileId = this.projectsDetailUIInfoService.profileId;

  private readonly searchForm = this.membersUIInfoService.searchForm;
  private readonly filterForm = this.membersUIInfoService.filterForm;

  private readonly destroy$ = new Subject<void>();

  /**
   * Инициализация компонента
   *
   * Выполняет:
   * - Очистку URL параметров
   * - Установку заголовка навигации
   * - Загрузку начальных данных из резолвера
   * - Настройку подписок на изменения форм и URL параметровК
   */
  initializationMembers(): void {
    // Очищаем URL параметры при инициализации
    this.router.navigate([], { queryParams: {} });

    // Устанавливаем заголовок страницы
    this.navService.setNavTitle("Участники");

    this.initializationProfile();

    this.initializationControls();

    // Подписываемся на изменения URL параметров для обновления списка участников
    this.initializationQueryParams();
  }

  private initializationProfile(): void {
    this.authService.profile
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: user => {
          this.projectsDetailUIInfoService.applySetLoggedUserId("profile", user.id);
        },
      });
  }

  private initializationControls(): void {
    this.route.data
      .pipe(
        take(1),
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe((members: ApiPagination<User>) => {
        this.membersUIInfoService.applyMembersPagination(members);
      });

    // Настраиваем синхронизацию значений форм с URL параметрами
    this.saveControlValue(this.searchForm.get("search"), "fullname");
    this.saveControlValue(this.filterForm.get("keySkill"), "skills__contains");
    this.saveControlValue(this.filterForm.get("speciality"), "speciality__icontains");
    this.saveControlValue(this.filterForm.get("age"), "age");
    this.saveControlValue(this.filterForm.get("isMosPolytechStudent"), "is_mospolytech_student");
  }

  private initializationQueryParams(): void {
    this.route.queryParams
      .pipe(
        skip(1), // Пропускаем первое значение
        distinctUntilChanged(), // Игнорируем одинаковые значения
        debounceTime(100), // Задержка для предотвращения частых запросов
        takeUntil(this.destroy$),
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

          this.searchParams.set(fetchParams);
          return this.onFetch(0, 20, fetchParams);
        })
      )
      .subscribe(members => {
        this.membersUIInfoService.applyQueryParams(members);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Обработчик события прокрутки для бесконечной прокрутки
   *
   * @returns Observable с дополнительными участниками или пустой объект
   */
  private onScroll(target: HTMLElement, membersRoot: ElementRef<HTMLUListElement>) {
    // Проверяем, есть ли еще участники для загрузки
    const total = this.membersUIInfoService.membersTotalCount();

    if (total !== undefined && this.membersUIInfoService.members().length >= total) {
      return EMPTY;
    }

    if (!target || !membersRoot?.nativeElement) return EMPTY;

    // Вычисляем, достиг ли пользователь конца списка
    const diff =
      target.scrollTop -
      membersRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      // Загружаем следующую порцию участников
      return this.onFetch(this.members().length, this.membersTake(), this.searchParams()).pipe(
        tap(membersChunk => {
          this.membersUIInfoService.applyMembersChunk(membersChunk);
        })
      );
    }

    return EMPTY;
  }

  initScroll(target: HTMLElement, membersRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(500),
        concatMap(() => this.onScroll(target, membersRoot)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /**
   * Сохраняет значение элемента формы в URL параметрах
   *
   * @param control - Элемент управления формы
   * @param queryName - Имя параметра в URL
   */
  private saveControlValue(control: AbstractControl | null, queryName: string): void {
    if (!control) return;

    control.valueChanges
      .pipe(throttleTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        this.router
          .navigate([], {
            queryParams: { [queryName]: value.toString() },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => console.debug("QueryParams changed from MembersComponent"));
      });
  }

  /**
   * Выполняет запрос на получение участников с заданными параметрами
   *
   * @param skip - Количество записей для пропуска (для пагинации)
   * @param take - Количество записей для получения
   * @param params - Дополнительные параметры фильтрации
   * @returns Observable<User[]> - Массив участников
   */
  private onFetch(skip: number, take: number, params?: Record<string, string | number | boolean>) {
    return this.memberService.getMembers(skip, take, params).pipe(takeUntil(this.destroy$));
  }

  redirectToProfile(): void {
    this.navigationService.profileRedirect(this.profileId());
  }
}
