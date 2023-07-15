/** @format */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProgramDetailComponent } from "@office/program/detail/detail/detail.component";
import { ProgramDetailResolver } from "@office/program/detail/detail/detail.resolver";

const routes: Routes = [
  {
    path: "",
    component: ProgramDetailComponent,
    resolve: {
      data: ProgramDetailResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramDetailRoutingModule {}
