/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonComponent, InputComponent } from "@ui/components";
import { AuthService } from "projects/social_platform/src/app/api/auth";

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
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, ControlErrorPipe],
})
export class SetPasswordComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.passwordForm = this.fb.group(
      {
        password: ["", [Validators.required, this.validationService.usePasswordValidator(8)]],
        passwordRepeated: ["", [Validators.required]],
      },
      { validators: [validationService.useMatchValidator("password", "passwordRepeated")] }
    );
  }

  passwordForm: FormGroup;
  isSubmitting = false;
  errorMessage = ErrorMessage;
  errorRequest = false;
  credsSubmitInitiated = false;

  showPassword = false;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get("token");
    if (!token) {
      // Handle the case where token is not present
      console.error("Token is missing");
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.credsSubmitInitiated = true;
    const token = this.route.snapshot.queryParamMap.get("token");

    if (!token || !this.validationService.getFormValidation(this.passwordForm)) return;

    this.authService.setPassword(this.passwordForm.value.password, token).subscribe({
      next: () => {
        this.router.navigateByUrl("/auth/login").then(() => console.debug("SetPasswordComponent"));
      },
      error: error => {
        console.error("Error setting password:", error);
        this.errorRequest = true;
      },
    });
  }
}
