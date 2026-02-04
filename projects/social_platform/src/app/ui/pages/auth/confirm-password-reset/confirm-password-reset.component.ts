/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { AuthPasswordService } from "projects/social_platform/src/app/api/auth/facades/auth-password.service";

/**
 * Компонент подтверждения сброса пароля
 *
 * Назначение: Отображает страницу с инструкциями после запроса сброса пароля
 * Принимает: email адрес через query параметры маршрута
 * Возвращает: Информационное сообщение о отправке письма для сброса пароля
 *
 * Функциональность:
 * - Получает email из query параметров
 * - Отображает подтверждение отправки письма для сброса пароля
 * - Информирует пользователя о следующих шагах
 */
@Component({
  selector: "app-confirm-password-reset",
  templateUrl: "./confirm-password-reset.component.html",
  styleUrl: "./confirm-password-reset.component.scss",
  providers: [AuthPasswordService],
  imports: [AsyncPipe],
  standalone: true,
})
export class ConfirmPasswordResetComponent implements OnInit {
  private readonly authPasswordService = inject(AuthPasswordService);

  protected readonly email = this.authPasswordService.email;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.authPasswordService.destroy();
  }
}
