/** @format */

import { inject } from "@angular/core";
import { WebinarService } from "./services/webinar.service";

export const WebinarsResolver = () => {
  const webinarService = inject(WebinarService);

  return webinarService.getActualWebinars(20, 0);
};
