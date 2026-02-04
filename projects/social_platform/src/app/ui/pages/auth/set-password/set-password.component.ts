/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "projects/core";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ButtonComponent, InputComponent } from "@ui/components";
import { AuthPasswordService } from "projects/social_platform/src/app/api/auth/facades/auth-password.service";
import { AuthUIInfoService } from "projects/social_platform/src/app/api/auth/facades/ui/auth-ui-info.service";

/**
 * Компонент установки нового пароля
 *
 * Назначение: Позволяет пользователю установить новый пароль после сброса
 * Принимает: Новый пароль, подтверждение пароля, токен сброса из URL
 * Возвращает: Перенаправление на страницу входа при успехе или отображение ошибок
 *
 * Функциональность:
 * - Форма с полями нового пароля и его подтверждения
 * - Валидация длины пароля (минимум 8 символов)
 * - Проверка совпадения паролей
 * - Показ/скрытие пароля
 * - Получение токена сброса из query параметров
 * - Отправка нового пароля на сервер
 * - Перенаправление на страницу входа при успехе
 */
@Component({
  selector: "app-set-password",
  templateUrl: "./set-password.component.html",
  styleUrl: "./set-password.component.scss",
  standalone: true,
  providers: [AuthPasswordService, AuthUIInfoService],
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, ControlErrorPipe],
})
export class SetPasswordComponent implements OnInit {
  private readonly authPasswordService = inject(AuthPasswordService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

  protected readonly passwordForm = this.authUIInfoService.passwordForm;

  protected readonly isSubmitting = this.authUIInfoService.isSubmitting;
  protected readonly errorRequest = this.authUIInfoService.errorRequest;
  protected readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;

  protected readonly errorMessage = ErrorMessage;

  protected readonly showPassword = this.authUIInfoService.showPassword;

  ngOnInit(): void {
    this.authPasswordService.init();
  }

  ngOnDestroy(): void {
    this.authPasswordService.destroy();
  }

  toggleShowPassword() {
    this.authUIInfoService.toggleShowPassword("login");
  }

  onSubmit() {
    this.authPasswordService.onSubmitSetPassword();
  }
}
