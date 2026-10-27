/** @format */
import { inject } from "@angular/core";
import { ResolveFn, Router } from "@angular/router";
import { catchError, EMPTY, tap } from "rxjs";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { Program } from "@domain/program/program.model";
import { AppRoutes } from "@api/paths/app-routes";
export const programPreviewResolver: ResolveFn<Program> = route => {
  const api = inject(ProgramLaunchUseCase);
  const ui = inject(ProgramDetailMainUIInfoService);
  const router = inject(Router);
  const id = Number(route.paramMap.get("programId"));
  return api.preview(id).pipe(
    tap(program => ui.applyFormatingProgramData(program)),
    catchError(() => {
      void router.navigate([AppRoutes.program.launch(id)], { queryParams: { previewError: 1 } });
      return EMPTY;
    }),
  );
};
