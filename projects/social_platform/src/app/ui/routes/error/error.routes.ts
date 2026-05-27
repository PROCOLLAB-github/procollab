/** @format */

import { Routes } from "@angular/router";
import { ErrorCodeComponent } from "@ui/pages/error/error-code/error-code.component";
import { ErrorComponent } from "@ui/pages/error/error.component";
import { ErrorNotFoundComponent } from "@ui/pages/error/not-found/error-not-found.component";

/** Конфигурация маршрутов для модуля ошибок. */
export const ERROR_ROUTES: Routes = [
  {
    path: "",
    component: ErrorComponent, // Родительский компонент-контейнер
    children: [
      {
        path: "404", // Статический маршрут для 404 ошибки
        component: ErrorNotFoundComponent,
      },
      {
        path: ":code", // Динамический маршрут для любого кода ошибки
        component: ErrorCodeComponent,
      },
    ],
  },
];
