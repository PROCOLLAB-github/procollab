/** @format */

import { DestroyRef, ElementRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import {
  concatMap,
  catchError,
  finalize,
  from,
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  map,
  merge,
  Subject,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
  timer,
} from "rxjs";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { MembersUIInfoService } from "./ui/members-ui-info.service";
import { NavigationService } from "../../paths/navigation.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { GetMembersUseCase } from "../use-cases/get-members.use-case";
import { isSuccess, loading, success } from "@domain/shared/async-state";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { memberFilterQueryParams, memberFiltersFromUrl, memberFiltersKey } from "../member-filters";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад списка участников: пагинация по скроллу, фильтры, `GetMembersUseCase`, переход в профиль. */
@Injectable()
export class MembersInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly navService = inject(NavService);
  private readonly navigationService = inject(NavigationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly membersUIInfoService = inject(MembersUIInfoService);

  private readonly getMembersUseCase = inject(GetMembersUseCase);

  private readonly searchParams = signal<Record<string, string>>({}); // Signal для параметров поиска
  private readonly membersTake = this.membersUIInfoService.membersTake; // Количество участников на странице

  private readonly profile = this.profileInfoService.profile;
  private readonly profileId = this.profileDetailUIInfoService.profileId;

  private readonly searchForm = this.membersUIInfoService.searchForm;
  private readonly filterForm = this.membersUIInfoService.filterForm;
  private readonly cancelFormChanges = new Subject<void>();
  private formRevision = 0;
  private urlRevision = 0;
  private pendingNavigation?: { key: string; formRevision: number };

  /** Инициализирует выдачу resolver и поиск из URL, не теряя запрос при обновлении страницы. */
  initializationMembers(): void {
    // Устанавливаем заголовок страницы
    this.navService.setNavTitle("Участники");

    this.profileDetailUIInfoService.applySetLoggedUserId("profile", this.profile()!.id);

    this.initializationControls();

    // Подписываемся на изменения URL параметров для обновления списка участников
    // (skip(1) пропускает начальное значение — данные уже загружены resolver'ом)
    this.initializationQueryParams();
    this.saveFormValues();
  }

  private initializationControls(): void {
    this.route.data
      .pipe(
        take(1),
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((members: ApiPagination<User>) => {
        this.membersUIInfoService.applyMembersPagination(members);
      });
  }

  private initializationQueryParams(): void {
    this.route.queryParams
      .pipe(
        map(memberFiltersFromUrl),
        tap(params => {
          const ownNavigation = this.pendingNavigation?.key === memberFiltersKey(params);
          if (!ownNavigation) {
            // Back/Forward и сброс отменяют как debounce, так и очередь старых правок.
            this.urlRevision++;
            this.cancelFormChanges.next();
          }
          if (!ownNavigation || this.pendingNavigation?.formRevision === this.formRevision) {
            this.restoreForm(params);
          }
        }),
        distinctUntilChanged((a, b) => memberFiltersKey(a) === memberFiltersKey(b)),
        tap(params => this.searchParams.set(params)),
        skip(1), // Первый запрос уже выполнен resolver с тем же контрактом URL.
        switchMap(fetchParams => {
          const prev = this.membersUIInfoService.members();
          this.membersUIInfoService.members$.set(loading(prev));
          return this.onFetch(0, 20, fetchParams);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(members => {
        this.membersUIInfoService.applyMembersPagination(members);
      });
  }

  private restoreForm(params: Record<string, string>): void {
    this.searchForm.patchValue({ search: params["fullname"] ?? "" }, { emitEvent: false });
    const age = params["age"]?.split(",").map(Number);
    this.filterForm.patchValue(
      {
        keySkill: params["skills__contains"] ?? "",
        speciality: params["speciality__icontains"] ?? "",
        age: age ? [age[0], age[1]] : [null, null],
        isMosPolytechStudent:
          params["is_mospolytech_student"] === undefined
            ? null
            : params["is_mospolytech_student"] === "true",
      },
      { emitEvent: false },
    );
  }

  /** Сброс работает и при пустом URL, когда Router не эмитит queryParams повторно. */
  resetFilters(): void {
    this.urlRevision++;
    this.cancelFormChanges.next();
    this.restoreForm({});
    this.router
      .navigate([], {
        queryParams: memberFilterQueryParams({}),
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .catch(() => this.logger.debug("Members filters reset failed"));
  }

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
      const requestParams = this.searchParams();
      // Загружаем следующую порцию участников
      return this.onFetch(
        this.membersUIInfoService.members().length,
        this.membersTake(),
        requestParams,
      ).pipe(
        tap(membersChunk => {
          // Поздняя страница прежнего поиска не должна дописаться к новой выдаче.
          if (requestParams !== this.searchParams()) return;
          this.membersUIInfoService.members$.update(state =>
            isSuccess(state)
              ? success([...state.data, ...membersChunk.results])
              : success(membersChunk.results),
          );
        }),
      );
    }

    return EMPTY;
  }

  /** Последовательно подгружает страницы текущего поиска. */
  initScroll(target: HTMLElement, membersRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(500),
        // concatMap (а не merge/switchMap): подгрузки идут строго последовательно,
        // иначе параллельные скроллы посчитают одинаковый skip (= текущая длина
        // списка) и придут дубли страниц.
        concatMap(() => this.onScroll(target, membersRoot)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private saveFormValues(): void {
    merge(
      this.searchForm.valueChanges.pipe(map(() => 300)),
      this.filterForm.valueChanges.pipe(map(() => 100)),
    )
      .pipe(
        tap(() => this.formRevision++),
        switchMap(delay => timer(delay).pipe(takeUntil(this.cancelFormChanges))),
        map(() => this.urlRevision),
        // Router.navigate асинхронный: следующая правка ждёт завершения текущей.
        concatMap(urlRevision => {
          if (urlRevision !== this.urlRevision) return EMPTY;
          const filters = this.filterForm.getRawValue();
          const params = memberFiltersFromUrl({
            fullname: this.searchForm.controls.search.value,
            skills__contains: filters.keySkill,
            speciality__icontains: filters.speciality,
            age: filters.age?.join(","),
            is_mospolytech_student:
              filters.isMosPolytechStudent == null
                ? undefined
                : String(filters.isMosPolytechStudent),
          });
          const key = memberFiltersKey(params);
          if (key === memberFiltersKey(this.searchParams())) return EMPTY;
          const navigation = { key, formRevision: this.formRevision };
          this.pendingNavigation = navigation;
          return from(
            this.router.navigate([], {
              queryParams: memberFilterQueryParams(params),
              relativeTo: this.route,
              queryParamsHandling: "merge",
            }),
          ).pipe(
            catchError(() => {
              this.logger.debug("Members filters navigation failed");
              return EMPTY;
            }),
            finalize(() => {
              if (this.pendingNavigation === navigation) this.pendingNavigation = undefined;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private onFetch(skip: number, take: number, params?: Record<string, string | number | boolean>) {
    return this.getMembersUseCase.execute(skip, take, params).pipe(
      map(result => (result.ok ? result.value : this.emptyMembersPagination())),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  redirectToProfile(): void {
    this.navigationService.profileRedirect(this.profileId());
  }

  private emptyMembersPagination(): ApiPagination<User> {
    return {
      count: 0,
      results: [],
      next: "",
      previous: "",
    };
  }
}
