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

  getGeneralRating() {
    return this.apiService
      .get<ApiPagination<GeneralRating>>("/progress/user-rating/")
      .pipe(map(res => res.results));
  }
}
