/** @format */

import { Routes } from "@angular/router";
import { ErrorComponent } from "./error.component";
import { ErrorCodeComponent } from "./code/error-code.component";
import { ErrorNotFoundComponent } from "./not-found/error-not-found.component";

/**
 * Конфигурация маршрутов для модуля ошибок
 *
 * Назначение:
 * - Определяет структуру маршрутов для обработки различных типов ошибок
 * - Настраивает вложенные маршруты с ErrorComponent как родительским
 *
 * Маршруты:
 * - "" (root): ErrorComponent - главный контейнер
 *   - "404": ErrorNotFoundComponent - страница "не найдено"
 *   - ":code": ErrorCodeComponent - страница с динамическим кодом ошибки
 *
 * Принимает: Нет параметров (экспортируемая константа)
 * Возвращает: Routes[] - массив конфигурации маршрутов для Angular Router
 */
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
