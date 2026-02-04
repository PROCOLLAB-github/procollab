/** @format */

import { Component, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

/**
 * Главный компонент модуля обработки ошибок
 *
 * Назначение:
 * - Служит контейнером для всех страниц ошибок
 * - Предоставляет общий layout с header и router-outlet
 * - Отображает логотип приложения в header
 *
 * Принимает: Нет входных параметров
 * Возвращает: HTML template с header и router-outlet для дочерних компонентов
 *
 * Дочерние маршруты:
 * - /error/404 - страница "не найдено"
 * - /error/:code - страница с кодом ошибки
 */
@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
  styleUrl: "./error.component.scss",
  standalone: true,
  imports: [RouterLink, RouterOutlet],
})
export class ErrorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
