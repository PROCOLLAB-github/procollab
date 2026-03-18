/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";
import { CreateVacancyDto } from "../../../api/project/dto/create-vacancy.model";
import { VacancyResponse } from "../../../domain/vacancy/vacancy-response.model";
import { Vacancy } from "../../../domain/vacancy/vacancy.model";
import { VacancyHttpAdapter } from "../../adapters/vacancy/vacancy-http.adapter";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";

@Injectable({ providedIn: "root" })
export class VacancyRepository implements VacancyRepositoryPort {
  private readonly vacancyAdapter = inject(VacancyHttpAdapter);

  /**
   * Получает вакансии и маппит сырой HTTP-ответ в доменную модель `Vacancy`.
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
    return this.vacancyAdapter
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
    return this.vacancyAdapter
      .getOne(vacancyId)
      .pipe(map(vacancy => plainToInstance(Vacancy, vacancy)));
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
}
