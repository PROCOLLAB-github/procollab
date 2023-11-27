/** @format */

import { Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { AuthRequiredGuard } from "@auth/guards/auth-required.guard";

export const APP_ROUTES: Routes = [
  {
    path: "",
    component: AppComponent,
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.routes").then(c => c.AUTH_ROUTES),
  },
  {
    path: "error",
    loadChildren: () => import("./error/error.routes").then(c => c.ERROR_ROUTES),
  },
  {
    path: "office",
    loadChildren: () => import("./office/office.routes").then(c => c.OFFICE_ROUTES),
    canActivate: [AuthRequiredGuard],
  },
  {
    path: "**",
    redirectTo: "error/404",
  },
];
