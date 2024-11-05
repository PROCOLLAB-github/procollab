/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { GeneralRating } from "../../../models/rating.model";
import { map } from "rxjs";
import { ApiPagination } from "../../../models/api-pagination.model";

@Injectable({
  providedIn: "root",
})
export class RatingService {
  apiService = inject(ApiService);

  getGeneralRating(ratingParam: "last_year" | "last_month" | "last_day" = "last_month") {
    return this.apiService
      .get<ApiPagination<GeneralRating>>(`/progress/user-rating/?time_frame=${ratingParam}`)
      .pipe(map(res => res.results));
  }
}
