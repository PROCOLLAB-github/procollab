/** @format */

import { Routes } from "@angular/router";
import { ProgramComponent } from "../../pages/program/program.component";
import { ProgramMainComponent } from "../../pages/program/main/main.component";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramLaunchRepositoryPort } from "@domain/program/ports/program-launch.repository.port";
import { ProgramLaunchHttpAdapter } from "@infrastructure/adapters/program/program-launch-http.adapter";
import type { ProgramCreateComponent } from "@ui/pages/program/create/create.component";
import { DeatilComponent } from "@ui/widgets/detail/detail.component";
import { ProgramDetailMainComponent } from "@ui/pages/program/detail/main/main.component";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { programPreviewResolver } from "@ui/pages/program/launch/preview.resolver";
import type { ProgramLaunchComponent } from "@ui/pages/program/launch/launch.component";
/** Конфигурация маршрутов для модуля "Программы". */
export const PROGRAM_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ProgramLaunchUseCase,
      { provide: ProgramLaunchRepositoryPort, useClass: ProgramLaunchHttpAdapter },
    ],
    children: [
      {
        path: "",
        component: ProgramComponent,
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "all",
          },
          {
            path: "all",
            component: ProgramMainComponent,
          },
          {
            path: "managed",
            loadComponent: () =>
              import("@ui/pages/program/managed/managed.component").then(
                m => m.ManagedProgramsComponent,
              ),
          },
        ],
      },
      {
        path: "create",
        loadComponent: () =>
          import("@ui/pages/program/create/create.component").then(m => m.ProgramCreateComponent),
        canDeactivate: [(component: ProgramCreateComponent) => component?.canDeactivate() ?? true],
      },
      {
        path: ":programId/preview",
        component: DeatilComponent,
        providers: [ProgramDetailMainUIInfoService],
        resolve: { data: programPreviewResolver },
        runGuardsAndResolvers: "always",
        data: { listType: "program" },
        children: [{ path: "", component: ProgramDetailMainComponent }],
      },
      {
        path: ":programId/launch",
        loadComponent: () =>
          import("@ui/pages/program/launch/launch.component").then(m => m.ProgramLaunchComponent),
        canDeactivate: [(component: ProgramLaunchComponent) => component?.canDeactivate() ?? true],
      },
      {
        path: ":programId",
        loadChildren: () => import("./detail.routes").then(c => c.PROGRAM_DETAIL_ROUTES),
      },
    ],
  },
];
