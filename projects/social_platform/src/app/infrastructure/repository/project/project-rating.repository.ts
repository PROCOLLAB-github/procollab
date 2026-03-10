/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProjectRate } from "../../../domain/project/project-rate";
import { ProjectRatingCriterion } from "../../../domain/project/project-rating-criterion";
import { ProjectRatingCriterionOutput } from "../../../domain/project/project-rating-criterion-output";
import { ProjectRatingHttpAdapter } from "../../adapters/project/project-rating-http.adapter";
import { ProjectRatingRepositoryPort } from "../../../domain/project/ports/project-rating.repository.port";

@Injectable({ providedIn: "root" })
export class ProjectRatingRepository implements ProjectRatingRepositoryPort {
  private readonly projectRatingAdapter = inject(ProjectRatingHttpAdapter);

  getAll(programId: number, params?: HttpParams): Observable<ApiPagination<ProjectRate>> {
    return this.projectRatingAdapter.getAll(programId, params);
  }

  postFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<ApiPagination<ProjectRate>> {
    return this.projectRatingAdapter.postFilters(programId, filters, params);
  }

  rate(projectId: number, scores: ProjectRatingCriterionOutput[]): Observable<void> {
    return this.projectRatingAdapter.rate(projectId, scores);
  }

  /*
    функция преобразует данные из формы вида { 1: 'value', 2: '5', 3: true },
    где ключом (key) является id критерия оценки, а значение является непосредственно значением оценки,
    к виду [{ criterionId: 1, value: 'value' }, { criterionId: 2, value: 5 }, { criterionId: 3, value: 'true' }],
  */
  formValuesToDTO(
    criteria: ProjectRatingCriterion[],
    outputVals: Record<string, string | number | boolean>
  ): ProjectRatingCriterionOutput[] {
    const output: ProjectRatingCriterionOutput[] = [];
    const normalizedOutputVals = { ...outputVals };

    for (const key in normalizedOutputVals) {
      // оценки с boolean значением переводятся в "string-boolean" (true => "True")
      if (typeof normalizedOutputVals[key] === "boolean") {
        const boolString = String(normalizedOutputVals[key]);
        normalizedOutputVals[key] = boolString.charAt(0).toUpperCase() + boolString.slice(1);
      }

      // оценки с числовым значением из инпута приходят строкой, их нужно привести к number
      if (criteria.find(c => c.id === Number(key))?.type === "int") {
        normalizedOutputVals[key] = Number(normalizedOutputVals[key]);
      }

      output.push({ criterionId: Number(key), value: normalizedOutputVals[key] });
    }

    return output;
  }
}
