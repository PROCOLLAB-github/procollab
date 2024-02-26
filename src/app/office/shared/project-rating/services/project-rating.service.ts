/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";
import { ProjectRate } from "../../../program/models/project-rate";
import {
  ProjectRatingCriterion,
  ProjectRatingCriterionOutput,
} from "@office/shared/project-rating/models";

@Injectable({
  providedIn: "root",
})
export class ProjectRatingService {
  constructor(private readonly apiService: ApiService) {}

  getAll(id: number, skip: number, take: number): Observable<ApiPagination<ProjectRate>> {
    return this.apiService.get(
      `/rate-project/${id}`,
      new HttpParams({ fromObject: { limit: take, offset: skip } })
    );
  }

  getRated(id: number, skip: number, take: number): Observable<ApiPagination<ProjectRate>> {
    return this.apiService.get(
      `/rate-project/scored/${id}`,
      new HttpParams({ fromObject: { limit: take, offset: skip } })
    );
  }

  rate(projectId: number, scores: ProjectRatingCriterionOutput[]): Observable<string> {
    return this.apiService.post(`/rate-project/rate/${projectId}`, scores);
  }

  formValuesToDTO(
    criteria: ProjectRatingCriterion[],
    outputVals: Record<string, unknown>
  ): ProjectRatingCriterionOutput[] {
    const output: ProjectRatingCriterionOutput[] = [];

    outputVals = Object.assign({}, outputVals);

    for (const key in outputVals) {
      if (typeof outputVals[key] === "boolean") {
        const boolString = String(outputVals[key]);
        outputVals[key] = boolString.charAt(0).toUpperCase() + boolString.slice(1);
      }

      if (criteria.find(c => c.id === Number(key))?.type === "int") {
        outputVals[key] = Number(outputVals[key]);
      }

      output.push({ criterion_id: Number(key), value: outputVals[key] });
    }

    return output;
  }
}
