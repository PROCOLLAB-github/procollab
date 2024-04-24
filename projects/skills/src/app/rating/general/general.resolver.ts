/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { RatingService } from "../services/rating.service";
import { GeneralRating } from "../../../models/rating.model";

export const generalRatingResolver: ResolveFn<GeneralRating[]> = () => {
  const ratingService = inject(RatingService);
  return ratingService.getGeneralRating();
};
