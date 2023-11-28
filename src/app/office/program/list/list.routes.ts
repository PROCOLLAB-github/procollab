/** @format */

import { Routes } from "@angular/router";
import { ProgramMainComponent } from "@office/program/list/main/main.component";
import { ProgramMainResolver } from "@office/program/list/main/main.resolver";

export const PROGRAM_LIST_ROUTES: Routes = [
  {
    path: "",
    component: ProgramMainComponent,
    resolve: {
      data: ProgramMainResolver,
    },
  },
];
