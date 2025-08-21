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
        password: ["", [Validators.required, this.validationService.usePasswordValidator(6)]],
        repeatedPassword: ["", [Validators.required]],
      },
      { validators: [this.validationService.useMatchValidator("password", "repeatedPassword")] }
    );
  }

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  registerForm: FormGroup;
  registerAgreement = false;
  ageAgreement = false;
  registerIsSubmitting = false;
  credsSubmitInitiated = false;
  infoSubmitInitiated = false;

  showPassword = false;
  showPasswordRepeat = false;

  isUserCreationModalError = false;

  serverErrors: string[] = [];

  step: "credentials" | "info" = "credentials";

  errorMessage = ErrorMessage;

  toggleShowPassword(type: "repeat" | "first") {
    if (type === "repeat") {
      this.showPasswordRepeat = !this.showPasswordRepeat;
    } else {
      this.showPassword = !this.showPassword;
    }
  }

  onInfoStep() {
    const fields = [
      this.registerForm.get("email"),
      this.registerForm.get("password"),
      this.registerForm.get("repeatedPassword"),
    ];

    const errors = fields.map(field => {
      field?.markAsTouched();
      return !!field?.valid;
    });

    if (errors.every(Boolean) && this.registerAgreement && this.ageAgreement) {
      this.step = "info";
    }
  }

  onSendForm(): void {
    if (!this.validationService.getFormValidation(this.registerForm)) {
      return;
    }

    const form = {
      ...this.registerForm.value,
      birthday: this.registerForm.value.birthday
        ? dayjs(this.registerForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
        : undefined,
    };
    delete form.repeatedPassword;

    this.registerIsSubmitting = true;

    this.authService.register(form).subscribe({
      next: () => {
        this.registerIsSubmitting = false;

        this.cdref.detectChanges();

        this.router
          .navigateByUrl("/auth/verification/email?adress=" + form.email)
          .then(() => console.debug("Route changed from RegisterComponent"));
      },
      error: error => {
        if (
          error.status === 400 &&
          error.error.email.some((msg: string) => msg.includes("email"))
        ) {
          // console.log(error);
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

  onSubmit() {
    if (this.step === "credentials") {
      this.credsSubmitInitiated = true;
      this.onInfoStep();
    } else if (this.step === "info") {
      this.infoSubmitInitiated = true;
      this.onSendForm();
    }
  }
}
