/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";
import { CreateVacancyDto } from "@domain/vacancy/dto/create-vacancy.model";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { VacancyHttpAdapter } from "../../adapters/vacancy/vacancy-http.adapter";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { EntityCache } from "@domain/shared/entity-cache";
import { EventBus } from "@domain/shared/event-bus";
import { VacancyCreated } from "@domain/vacancy/events/vacancy-created.event";
import { VacancyUpdated } from "@domain/vacancy/events/vacancy-updated.event";
import { VacancyDelete } from "@domain/vacancy/events/vacancy-deleted.event";
import { LoggedOut } from "@domain/auth/events/logged-out.event";

/** Репозиторий вакансий с кешем деталей и инвалидацией по событиям вакансий. */
@Injectable({ providedIn: "root" })
export class VacancyRepository implements VacancyRepositoryPort {
  private readonly vacancyAdapter = inject(VacancyHttpAdapter);
  private readonly eventBus = inject(EventBus);
  private readonly entityCache = new EntityCache<Vacancy>();
  // Кеш первой страницы вакансий проекта (limit=20, offset=0, без фильтров) по projectId.
  // На info-resolver'е и shell-точках это самый частый вызов — кешируем его, остальные
  // (с фильтрами/пагинацией/поиском) идут напрямую без кеша.
  private readonly projectVacanciesCache = new EntityCache<Vacancy[]>();

  constructor() {
    this.eventBus.on<VacancyCreated>("VacancyCreated").subscribe(event => {
      this.invalidate(event.payload.projectId);
      this.projectVacanciesCache.invalidate(event.payload.projectId);
    });

    this.eventBus.on<VacancyUpdated>("VacancyUpdated").subscribe(event => {
      this.invalidate(event.payload.vacancyId);
      // Событие содержит только vacancyId — точечно инвалидировать project нельзя,
      // безопаснее очистить весь кеш проектных листов (вакансия могла изменить поля,
      // которые рендерятся в списке).
      this.projectVacanciesCache.clear();
    });

    this.eventBus.on<VacancyDelete>("VacancyDelete").subscribe(event => {
      this.invalidate(event.payload.vacancyId);
      this.projectVacanciesCache.clear();
    });

    this.eventBus.on<LoggedOut>("LoggedOut").subscribe({
      next: () => {
        this.entityCache.clear();
        this.projectVacanciesCache.clear();
      },
    });
  }

  /**
   * Получает вакансии и маппит сырой HTTP-ответ в доменную модель `Vacancy`.
   * Если запрос — это «первая страница проекта без фильтров», результат кешируется
   * по projectId и переиспользуется при повторных заходах на проект.
   */
  getForProject(
    limit: number,
    offset: number,
    projectId?: number,
    requiredExperience?: string,
    workFormat?: string,
    workSchedule?: string,
    salary?: string,
    searchValue?: string
  ): Observable<Vacancy[]> {
    const isDefaultFirstPage =
      projectId !== undefined &&
      limit === 20 &&
      offset === 0 &&
      !requiredExperience &&
      !workFormat &&
      !workSchedule &&
      !salary &&
      !searchValue;

    const fetch$ = this.vacancyAdapter
      .getForProject(
        limit,
        offset,
        projectId,
        requiredExperience,
        workFormat,
        workSchedule,
        salary,
        searchValue
      )
      .pipe(map(vacancies => plainToInstance(Vacancy, vacancies)));

    return isDefaultFirstPage
      ? this.projectVacanciesCache.getOrFetch(projectId!, () => fetch$)
      : fetch$;
  }

  /**
   * Получает мои отклики и маппит их в доменную модель `VacancyResponse`.
   */
  getMyVacancies(limit: number, offset: number): Observable<VacancyResponse[]> {
    return this.vacancyAdapter
      .getMyVacancies(limit, offset)
      .pipe(map(responses => plainToInstance(VacancyResponse, responses)));
  }

  /**
   * Получает одну вакансию и маппит ее в доменную модель `Vacancy`.
   */
  getOne(vacancyId: number): Observable<Vacancy> {
    return this.entityCache.getOrFetch(vacancyId, () =>
      this.vacancyAdapter.getOne(vacancyId).pipe(map(vacancy => plainToInstance(Vacancy, vacancy)))
    );
  }

  /**
   * Создает вакансию и маппит ответ в доменную модель `Vacancy`.
   */
  postVacancy(projectId: number, vacancy: CreateVacancyDto): Observable<Vacancy> {
    return this.vacancyAdapter
      .postVacancy(projectId, vacancy)
      .pipe(map(createdVacancy => plainToInstance(Vacancy, createdVacancy)));
  }

  /**
   * Обновляет вакансию и маппит ответ в доменную модель `Vacancy`.
   */
  updateVacancy(
    vacancyId: number,
    vacancy: Partial<Vacancy> | CreateVacancyDto
  ): Observable<Vacancy> {
    return this.vacancyAdapter
      .updateVacancy(vacancyId, vacancy)
      .pipe(map(updatedVacancy => plainToInstance(Vacancy, updatedVacancy)));
  }

  deleteVacancy(vacancyId: number): Observable<void> {
    this.invalidate(vacancyId);
    return this.vacancyAdapter.deleteVacancy(vacancyId);
  }

  sendResponse(vacancyId: number, body: { whyMe: string }): Observable<VacancyResponse> {
    return this.vacancyAdapter
      .sendResponse(vacancyId, body)
      .pipe(map(response => plainToInstance(VacancyResponse, response)));
  }

  /**
   * Получает отклики проекта и маппит ответ в доменную модель `VacancyResponse`.
   */
  responsesByProject(projectId: number): Observable<VacancyResponse[]> {
    return this.vacancyAdapter
      .responsesByProject(projectId)
      .pipe(map(responses => plainToInstance(VacancyResponse, responses)));
  }

  acceptResponse(responseId: number): Observable<VacancyResponse> {
    return this.vacancyAdapter
      .acceptResponse(responseId)
      .pipe(map(response => plainToInstance(VacancyResponse, response)));
  }

  rejectResponse(responseId: number): Observable<VacancyResponse> {
    return this.vacancyAdapter
      .rejectResponse(responseId)
      .pipe(map(response => plainToInstance(VacancyResponse, response)));
  }

  invalidate(vacancyId: number): void {
    this.entityCache.invalidate(vacancyId);
  }
}
