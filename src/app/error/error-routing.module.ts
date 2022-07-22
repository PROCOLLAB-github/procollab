/** @format */

import { RouterModule, Routes } from "@angular/router";
import { ErrorComponent } from "./error.component";
import { NgModule } from "@angular/core";
import { ErrorCodeComponent } from "./code/error-code.component";
import { ErrorNotFoundComponent } from "./not-found/error-not-found.component";

const routes: Routes = [
  {
    path: "",
    component: ErrorComponent,
    children: [
      {
        path: "404",
        component: ErrorNotFoundComponent,
      },
      {
        path: ":code",
        component: ErrorCodeComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorRoutingModule {}
