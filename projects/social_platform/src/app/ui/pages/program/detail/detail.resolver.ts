/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { Program } from "@domain/program/program.model";
import { map, of, tap } from "rxjs";
import { GetProgramUseCase } from "@api/program/use-cases/get-program.use-case";

/** Предзагружает детальную информацию о программе. */
export const ProgramDetailResolver: ResolveFn<Program> = (route: ActivatedRouteSnapshot) => {
  const getProgramUseCase = inject(GetProgramUseCase);
  const programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  const programId = Number(route.params["programId"]);
  const program$ =
    Number.isInteger(programId) && programId > 0
      ? getProgramUseCase
          .execute(programId)
          .pipe(map(result => (result.ok ? result.value : new Program())))
      : of(new Program());

  return program$.pipe(
    tap(program => programDetailMainUIInfoService.applyFormatingProgramData(program)),
  );
};
