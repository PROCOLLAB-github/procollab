/** @format */

import { inject } from "@angular/core";
import { ProgramService } from "@office/program/services/program.service";
import { ResolveFn } from "@angular/router";
import { ApiPagination } from "@models/api-pagination.model";
import { Program } from "@office/program/models/program.model";

export const ProgramMainResolver: ResolveFn<ApiPagination<Program>> = () => {
  const programService = inject(ProgramService);

  return programService.getAll(0, 20);
};
