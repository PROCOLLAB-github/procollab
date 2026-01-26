/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe, TokenService } from "projects/core";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { RouterLink } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { ButtonComponent, CheckboxComponent, InputComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";
import { AuthRegisterService } from "projects/social_platform/src/app/api/auth/facades/auth-register.service";
import { AuthUIInfoService } from "projects/social_platform/src/app/api/auth/facades/ui/auth-ui-info.service";

dayjs.extend(cpf);

/**
 * Компонент регистрации нового пользователя
 *
 * Назначение: Реализует двухэтапную форму регистрации с валидацией
 * Принимает: Данные пользователя через форму (email, пароль, личные данные)
 * Возвращает: Перенаправление на страницу подтверждения email или отображение ошибок
 *
 * Функциональность:
 * - Двухэтапная регистрация (учетные данные → личная информация)
 * - Валидация email, пароля, имени, фамилии, даты рождения
 * - Проверка совпадения паролей
 * - Обработка согласий пользователя
 * - Отправка данных на сервер и обработка ошибок
 * - Показ/скрытие паролей
 * - Модальное окно при ошибке создания аккаунта
 */
@Component({
  selector: "app-login",
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    CheckboxComponent,
    ButtonComponent,
    ModalComponent,
    RouterLink,
    IconComponent,
    ControlErrorPipe,
  ],
  providers: [AuthRegisterService, AuthUIInfoService],
  standalone: true,
})
export class RegisterComponent implements OnInit {
  private readonly authRegisterService = inject(AuthRegisterService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly tokenService = inject(TokenService);

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  ngOnDestroy(): void {
    this.authRegisterService.destroy();
  }

  protected readonly registerForm = this.authUIInfoService.registerForm;
  protected readonly registerIsSubmitting = this.authUIInfoService.registerIsSubmitting;

  protected readonly registerAgreement = this.authUIInfoService.registerAgreement;
  protected readonly ageAgreement = this.authUIInfoService.ageAgreement;

  protected readonly showPassword = this.authUIInfoService.showPassword;
  protected readonly showPasswordRepeat = this.authUIInfoService.showPasswordRepeat;

  protected readonly isUserCreationModalError = this.authUIInfoService.isUserCreationModalError;

  protected readonly serverErrors = this.authRegisterService.serverErrors;

  protected readonly errorMessage = ErrorMessage;

  toggleShowPassword(type: "repeat" | "first") {
    this.authUIInfoService.toggleShowPassword("register", type);
  }

  onSendForm(): void {
    this.authRegisterService.onSendForm();
  }
}
