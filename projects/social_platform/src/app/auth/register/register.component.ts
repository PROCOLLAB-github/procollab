/** @format */

import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, TokenService, ValidationService } from "projects/core";
import { ErrorMessage } from "@error/models/error-message";
import { Router, RouterLink } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { ButtonComponent, CheckboxComponent, InputComponent } from "@ui/components";
import { AuthService } from "@auth/services";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";

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
  standalone: true,
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
})
export class RegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router,
    private validationService: ValidationService,
    private cdref: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ["", [Validators.required, this.validationService.useLanguageValidator()]],
        lastName: ["", [Validators.required, this.validationService.useLanguageValidator()]],
        birthday: [
          "",
          [
            Validators.required,
            this.validationService.useDateFormatValidator,
            this.validationService.useAgeValidator(),
          ],
        ],
        email: [
          "",
          [Validators.required, Validators.email, this.validationService.useEmailValidator()],
        ],
        password: ["", [Validators.required, this.validationService.usePasswordValidator(8)]],
        repeatedPassword: ["", [Validators.required]],
        phoneNumber: ["", [Validators.maxLength(15)]],
      },
      { validators: [validationService.useMatchValidator("password", "repeatedPassword")] }
    );
  }

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  registerForm: FormGroup;
  registerAgreement = false;
  ageAgreement = false;
  registerIsSubmitting = false;

  showPassword = false;
  showPasswordRepeat = false;

  isUserCreationModalError = false;

  serverErrors: string[] = [];

  errorMessage = ErrorMessage;

  toggleShowPassword(type: "repeat" | "first") {
    if (type === "repeat") {
      this.showPasswordRepeat = !this.showPasswordRepeat;
    } else {
      this.showPassword = !this.showPassword;
    }
  }

  onSendForm(): void {
    if (!this.validationService.getFormValidation(this.registerForm)) {
      return;
    }

    const payload = {
      ...this.registerForm.value,
      birthday: this.registerForm.value.birthday
        ? dayjs(this.registerForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
        : undefined,
      phoneNumber:
        typeof this.registerForm.value.phoneNumber === "string"
          ? this.registerForm.value.phoneNumber.replace(/^([87])/, "+7")
          : this.registerForm.value.phoneNumber,
    };

    delete payload.repeatedPassword;

    this.registerIsSubmitting = true;

    this.authService.register(payload).subscribe({
      next: () => {
        this.registerIsSubmitting = false;

        this.cdref.detectChanges();

        this.router
          .navigateByUrl("/auth/verification/email?adress=" + payload.email)
          .then(() => console.debug("Route changed from RegisterComponent"));
      },
      error: error => {
        if (
          error.status === 400 &&
          error.error.email.some((msg: string) => msg.includes("email"))
        ) {
          this.serverErrors = Object.values(error.error).flat() as string[];
          console.log(this.serverErrors);
        } else if (error.status === 500) {
          this.isUserCreationModalError = true;
        }

        this.registerIsSubmitting = false;
        this.cdref.detectChanges();
      },
    });
  }
}
