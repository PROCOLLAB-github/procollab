/** @format */

import { Component, OnInit } from "@angular/core";

/**
 * Компонент для отображения ошибки 404 "Страница не найдена"
 *
 * Назначение:
 * - Отображает пользователю сообщение о том, что запрашиваемая страница не найдена
 * - Показывает иллюстрацию и текст ошибки на русском языке
 * - Используется для статического маршрута /error/404
 *
 * Принимает: Нет входных параметров
 * Возвращает: HTML template с изображением и сообщением об ошибке 404
 *
 * Особенности:
 * - Standalone компонент (не требует NgModule)
 * - Не имеет зависимостей от других сервисов
 */
@Component({
  selector: "app-not-found",
  templateUrl: "./error-not-found.component.html",
  styleUrl: "./error-not-found.component.scss",
  standalone: true,
})
export class ErrorNotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
