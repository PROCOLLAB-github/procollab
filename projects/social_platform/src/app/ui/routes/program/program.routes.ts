/** @format */

import { Routes } from "@angular/router";
import { ProgramComponent } from "../../pages/program/program.component";
import { ProgramMainComponent } from "../../pages/program/main/main.component";
/** Конфигурация маршрутов для модуля "Программы". */
export const PROGRAM_ROUTES: Routes = [
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
    ],
  },
  {
    path: ":programId",
    loadChildren: () => import("./detail.routes").then(c => c.PROGRAM_DETAIL_ROUTES),
  },
];
