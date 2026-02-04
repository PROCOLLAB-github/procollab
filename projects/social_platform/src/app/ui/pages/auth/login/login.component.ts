/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
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
import { AuthUIInfoService } from "projects/social_platform/src/app/api/auth/facades/ui/auth-ui-info.service";
import { AuthLoginService } from "projects/social_platform/src/app/api/auth/facades/auth-login.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";

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
  providers: [AuthLoginService, AuthUIInfoService, TooltipInfoService],
  standalone: true,
})
export class LoginComponent implements OnInit {
  private readonly authLoginService = inject(AuthLoginService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly tokenService = inject(TokenService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly loginForm = this.authUIInfoService.loginForm;
  protected readonly loginIsSubmitting = this.authUIInfoService.loginIsSubmitting;

  protected readonly errorWrongAuth = this.authUIInfoService.errorWrongAuth;

  protected readonly errorMessage = ErrorMessage;

  protected readonly showPassword = this.authUIInfoService.showPassword;
  protected readonly isHintLoginVisible = this.tooltipInfoService.isHintLoginVisible;

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  ngOnDestroy(): void {
    this.authLoginService.destroy();
  }

  toggleTooltip(): void {
    this.tooltipInfoService.toggleTooltip();
  }

  toggleShowPassword() {
    this.authUIInfoService.toggleShowPassword("login");
  }

  onSubmit() {
    this.authLoginService.onSubmit();
  }
}
