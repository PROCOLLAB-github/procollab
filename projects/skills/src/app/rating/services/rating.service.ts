/** @format */

import { inject, Injectable } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { GeneralRating } from "../../../models/rating.model";
import { map } from "rxjs";
import { ApiPagination } from "../../../models/api-pagination.model";

@Injectable({
  providedIn: "root",
})
export class RatingService {
  apiService = inject(SkillsApiService);

  getGeneralRating(
    ratingParam: "last_year" | "last_month" | "last_day" | "last_week" = "last_month"
  ) {
    return this.apiService
      .get<ApiPagination<GeneralRating>>(`/progress/user-rating/?time_frame=${ratingParam}`)
      .pipe(map(res => res.results));
  }
}
