/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ControlErrorPipe, TokenService, ValidationService } from "projects/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/components";
import { CommonModule } from "@angular/common";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ClickOutsideModule } from "ng-click-outside";
import { AuthService } from "projects/social_platform/src/app/api/auth";

/**
 * Компонент входа в систему
 *
 * Назначение: Реализует форму входа пользователя в систему
 * Принимает: Email и пароль пользователя через форму, параметр redirect из URL
 * Возвращает: Перенаправление в офис при успехе или отображение ошибок
 *
 * Функциональность:
 * - Форма входа с полями email и пароля
 * - Валидация email и обязательных полей
 * - Показ/скрытие пароля
 * - Отправка данных на сервер для аутентификации
 * - Сохранение токенов при успешном входе
 * - Обработка ошибок аутентификации (неверные данные)
 * - Поддержка различных типов перенаправления после входа
 * - Очистка токенов при инициализации
 */
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
    TooltipComponent,
    ClickOutsideModule,
  ],
})
export class LoginComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly validationService: ValidationService,
    private readonly cdref: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  loginForm: FormGroup;
  loginIsSubmitting = false;

  errorWrongAuth = false;

  errorMessage = ErrorMessage;

  showPassword = false;
  readonly isHintLoginVisible = signal<boolean>(false);

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  toggleTooltip(): void {
    this.isHintLoginVisible.set(!this.isHintLoginVisible());
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    const redirectType = this.route.snapshot.queryParams["redirect"];

    if (!this.validationService.getFormValidation(this.loginForm) || this.loginIsSubmitting) {
      return;
    }

    this.loginIsSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.tokenService.memTokens(res);
        this.loginIsSubmitting = false;

        this.cdref.detectChanges();

        if (!redirectType)
          this.router
            .navigateByUrl("/office")
            .then(() => console.debug("Route changed from LoginComponent"));
        else if (redirectType === "program")
          this.router
            .navigateByUrl("/office/program/list")
            .then(() => console.debug("Route changed from LoginComponent"));
      },
      error: error => {
        if (error.status === 401) {
          this.errorWrongAuth = true;
        }

        this.loginIsSubmitting = false;
        this.cdref.detectChanges();
      },
    });
  }
}
