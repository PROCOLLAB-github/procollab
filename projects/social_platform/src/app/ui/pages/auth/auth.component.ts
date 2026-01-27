/** @format */

import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";

/**
 * Основной компонент модуля аутентификации
 *
 * Назначение: Корневой компонент для всех страниц аутентификации (вход, регистрация, сброс пароля)
 * Принимает: Не принимает входных параметров
 * Возвращает: Рендерит router-outlet для дочерних компонентов аутентификации
 *
 * Функциональность:
 * - Предоставляет общий layout для страниц аутентификации
 * - Содержит router-outlet для отображения дочерних компонентов
 */
@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.scss",
  standalone: true,
  imports: [RouterOutlet],
})
export class AuthComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
