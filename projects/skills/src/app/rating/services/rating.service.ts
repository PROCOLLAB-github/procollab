/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { GeneralRating } from "../../../models/rating.model";

@Injectable({
  providedIn: "root",
})
export class RatingService {
  apiService = inject(ApiService);

  getGeneralRating() {
    return this.apiService.get<GeneralRating[]>("/progress/user-rating/");
  }
}
