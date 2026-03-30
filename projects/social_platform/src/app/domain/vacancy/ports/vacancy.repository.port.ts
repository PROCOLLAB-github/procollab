/** @format */

import { Observable } from "rxjs";
import { Vacancy } from "../vacancy.model";
import { VacancyResponse } from "../vacancy-response.model";
import { CreateVacancyDto } from "@api/project/dto/create-vacancy.model";

/**
 * Порт репозитория вакансий.
 * Реализуется в infrastructure/repository/vacancy/vacancy.repository.ts
 */
export abstract class VacancyRepositoryPort {
  abstract getForProject(
    limit: number,
    offset: number,
    projectId?: number,
    requiredExperience?: string,
    workFormat?: string,
    workSchedule?: string,
    salary?: string,
    searchValue?: string
  ): Observable<Vacancy[]>;
  abstract getMyVacancies(limit: number, offset: number): Observable<VacancyResponse[]>;
  abstract getOne(vacancyId: number): Observable<Vacancy>;
  abstract postVacancy(projectId: number, vacancy: CreateVacancyDto): Observable<Vacancy>;
  abstract updateVacancy(
    vacancyId: number,
    vacancy: Partial<Vacancy> | CreateVacancyDto
  ): Observable<Vacancy>;
  abstract deleteVacancy(vacancyId: number): Observable<void>;
  abstract sendResponse(vacancyId: number, body: { whyMe: string }): Observable<VacancyResponse>;
  abstract responsesByProject(projectId: number): Observable<VacancyResponse[]>;
  abstract acceptResponse(responseId: number): Observable<VacancyResponse>;
  abstract rejectResponse(responseId: number): Observable<VacancyResponse>;
}
