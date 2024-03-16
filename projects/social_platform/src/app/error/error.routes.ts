/** @format */

import { Routes } from "@angular/router";
import { ErrorComponent } from "./error.component";
import { ErrorCodeComponent } from "./code/error-code.component";
import { ErrorNotFoundComponent } from "./not-found/error-not-found.component";

export const ERROR_ROUTES: Routes = [
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
