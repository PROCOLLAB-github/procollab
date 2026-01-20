/** @format */

import { Injectable, signal } from "@angular/core";
import { VacancyResponse } from "projects/social_platform/src/app/domain/vacancy/vacancy-response.model";

@Injectable()
export class ProjectsDetailWorkSectionUIInfoService {
  readonly vacancies = signal<VacancyResponse[]>([]);

  applyInitVacancies(responses: VacancyResponse[]): void {
    this.vacancies.set(
      responses.filter((response: VacancyResponse) => response.isApproved === null)
    );
  }

  applyFilterVacacnies(responseId: number): void {
    this.vacancies.update(vacancies => vacancies.filter(vacancy => vacancy.id !== responseId));
  }
}
