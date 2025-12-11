/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs";
import { AsyncPipe } from "@angular/common";

/**
 * Компонент для отображения ошибок с динамическим кодом
 *
 * Назначение:
 * - Отображает страницу ошибки с кодом, переданным через URL параметр
 * - Извлекает код ошибки из route параметров и отображает его
 * - Предоставляет ссылку для возврата на главную страницу
 *
 * Принимает:
 * - :code (route parameter) - код ошибки из URL (например, 500, 403, etc.)
 *
 * Возвращает:
 * - HTML template с кодом ошибки, сообщением и ссылкой на главную
 *
 * Свойства:
 * - errorCode: Observable<string> - код ошибки из URL параметров
 *
 * Зависимости:
 * - ActivatedRoute - для получения параметров маршрута
 */
@Component({
  selector: "app-code",
  templateUrl: "./error-code.component.html",
  styleUrl: "./error-code.component.scss",
  standalone: true,
  imports: [RouterLink, AsyncPipe],
})
export class ErrorCodeComponent implements OnInit {
  // Observable с кодом ошибки, извлеченным из URL параметра 'code'
  errorCode = this.activatedRoute.params.pipe(map(r => r["code"]));

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {}
}
