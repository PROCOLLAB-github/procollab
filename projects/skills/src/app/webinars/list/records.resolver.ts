/** @format */

import { inject } from "@angular/core";
import { WebinarService } from "../services/webinar.service";

export const RecordsResolver = () => {
  const webinarService = inject(WebinarService);

  return webinarService.getRecords(20, 0);
};
