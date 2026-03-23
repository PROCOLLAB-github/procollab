/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { ProjectRate } from "../project-rate";
import { HttpParams } from "@angular/common/http";
import { ProjectRatingCriterionOutput } from "../project-rating-criterion-output";
import { ProjectRatingCriterion } from "../project-rating-criterion";

export abstract class ProjectRatingRepositoryPort {
  abstract getAll(programId: number, params?: HttpParams): Observable<ApiPagination<ProjectRate>>;

  abstract postFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<ApiPagination<ProjectRate>>;

  abstract rate(projectId: number, scores: ProjectRatingCriterionOutput[]): Observable<void>;

  abstract formValuesToDTO(
    criteria: ProjectRatingCriterion[],
    outputVals: Record<string, string | number | boolean>
  ): ProjectRatingCriterionOutput[];
}
