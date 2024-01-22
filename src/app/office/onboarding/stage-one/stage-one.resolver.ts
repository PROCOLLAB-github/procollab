/** @format */

import { inject } from "@angular/core";
import type { ResolveFn } from "@angular/router";
import { SpecializationsService } from "@office/services/specializations.service";
import { SpecializationsGroup } from "@office/models/specializations-group";

export const StageOneResolver: ResolveFn<SpecializationsGroup[]> = () => {
  const specializationsService = inject(SpecializationsService);

  return specializationsService.getSpecializationsNested();
};
