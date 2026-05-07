/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent, InputComponent } from "@ui/primitives";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { AuthPasswordService } from "@api/auth/facades/auth-password.service";

/**
 * Компонент запроса сброса пароля
 *
 * Назначение: Позволяет пользователю запросить сброс пароля по email
 * Принимает: Email адрес пользователя через форму
 * Возвращает: Перенаправление на страницу подтверждения или отображение ошибки
 *
 * Функциональность:
 * - Форма с полем email для запроса сброса пароля
 * - Валидация email адреса
 * - Отправка запроса на сервер
 * - Обработка ошибок (неверный email)
 * - Перенаправление на страницу подтверждения при успехе
 */
@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.scss",
  standalone: true,
  providers: [AuthPasswordService, AuthUIInfoService],
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, ControlErrorPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly authPasswordService = inject(AuthPasswordService);

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.authPasswordService.destroy();
  }

  protected readonly resetForm = this.authUIInfoService.resetForm;
  protected readonly isSubmitting = this.authUIInfoService.isSubmitting;
  protected readonly errorServer = this.authUIInfoService.errorServer;

  protected readonly errorMessage = ErrorMessage;

  onSubmit(): void {
    this.authPasswordService.onSubmitResetPassword();
  }
}
