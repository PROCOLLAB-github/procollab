/** @format */

import { Routes } from "@angular/router";
import { RatingGeneralComponent } from "./general/general.component";
import { generalRatingResolver } from "./general/general.resolver";

export const RATING_ROUTES: Routes = [
  {
    path: "",
    component: RatingGeneralComponent,
    resolve: {
      data: generalRatingResolver,
    },
  },
];
