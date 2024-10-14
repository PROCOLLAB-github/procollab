/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";
import { ProjectRate } from "../models/project-rate";
import { ProjectRatingCriterion } from "../models/project-rating-criterion";
import { ProjectRatingCriterionOutput } from "../models/project-rating-criterion-output";

@Injectable({
  providedIn: "root",
})
export class ProjectRatingService {
  constructor(private readonly apiService: ApiService) {}

  getAll(
    id: number,
    skip: number,
    take: number,
    is_rated_by_expert?: boolean
  ): Observable<ApiPagination<ProjectRate>> {
    return this.apiService.get(
      `/rate-project/${id}`,
      new HttpParams({
        fromObject: {
          ...(is_rated_by_expert !== undefined && { is_rated_by_expert }),
          limit: take,
          offset: skip,
        },
      })
    );
  }

  rate(projectId: number, scores: ProjectRatingCriterionOutput[]): Observable<void> {
    return this.apiService.post(`/rate-project/rate/${projectId}`, scores);
  }

  /*
    функция преобразует данные из формы вида { 1: 'value', 2: '5', 3: true },
    где ключом (key) является id критерия оценки, а значение является непосредственно значением оценки,
    к виду [{ criterionId: 1, value: 'value' }, { criterionId: 2, value: 5 }, { criterionId: 3, value: 'true' }],
  */
  formValuesToDTO(
    criteria: ProjectRatingCriterion[],
    outputVals: Record<string, string | number>
  ): ProjectRatingCriterionOutput[] {
    const output: ProjectRatingCriterionOutput[] = [];

    outputVals = Object.assign({}, outputVals);

    for (const key in outputVals) {
      // оценки с boolean значением переводятся в "string-boolean" (true => "true")
      if (typeof outputVals[key] === "boolean") {
        const boolString = String(outputVals[key]);
        outputVals[key] = boolString.charAt(0).toUpperCase() + boolString.slice(1);
      }
      // оценки с числовым значением поступают в виде string (из инпута), и их требуется привести к типу number
      // поскольку типом string могут обладать не только оценки с числовым значением, но и "комментарий",
      // нужно явно убедиться, что критерий именно числовой, для чего осуществляется поиск критерия по id
      // в списке критериев оценки проекта и проверка его принадлежности типу "int"
      if (criteria.find(c => c.id === Number(key))?.type === "int") {
        outputVals[key] = Number(outputVals[key]);
      }

      output.push({ criterionId: Number(key), value: outputVals[key] });
    }

    return output;
  }
}
