/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ApiPagination } from "@office/models/api-pagination.model";
import { ProjectRate } from "@office/program/models/project-rate";
import { ProjectRatingService } from "@office/shared/project-rating/services/project-rating.service";

export const ListRatedResolver: ResolveFn<ApiPagination<ProjectRate>> = (
  route: ActivatedRouteSnapshot
) => {
  const projectRatingService = inject(ProjectRatingService);

  return projectRatingService.getRated(route.parent?.params["programId"], 0, 8);
};
