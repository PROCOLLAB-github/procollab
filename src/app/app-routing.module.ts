/** @format */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";

const routes: Routes = [
  {
    path: "",
    component: AppComponent,
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule),
  },
  {
    path: "error",
    loadChildren: () => import("./error/error.module").then(m => m.ErrorModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
