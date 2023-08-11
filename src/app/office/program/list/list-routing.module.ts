/** @format */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProgramMainComponent } from "@office/program/list/main/main.component";
import { ProgramMainResolver } from "@office/program/list/main/main.resolver";

const routes: Routes = [
  {
    path: "",
    component: ProgramMainComponent,
    resolve: {
      data: ProgramMainResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramListRoutingModule {}
