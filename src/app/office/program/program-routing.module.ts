/** @format */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "list",
    loadChildren: () => import("./list/list.module").then(m => m.ProgramListModule),
  },
  {
    path: ":programId",
    loadChildren: () => import("./detail/detail.module").then(m => m.ProgramDetailModule),
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramRoutingModule {}
