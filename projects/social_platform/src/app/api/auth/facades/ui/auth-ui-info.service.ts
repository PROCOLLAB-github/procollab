/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@corelib";
import dayjs from "dayjs";

@Injectable()
export class AuthUIInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  // login
  readonly showPasswordRepeat = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  readonly loginIsSubmitting = signal<boolean>(false);
  readonly errorWrongAuth = signal<boolean>(false);

  // password
  readonly isSubmitting = signal<boolean>(false);
  readonly credsSubmitInitiated = signal<boolean>(false);

  readonly errorServer = signal<boolean>(false);
  readonly errorRequest = signal<boolean>(false);

  // register
  readonly registerAgreement = signal<boolean>(false);
  readonly ageAgreement = signal<boolean>(false);

  readonly registerIsSubmitting = signal<boolean>(false);
  readonly infoSubmitInitiated = signal<boolean>(false);

  readonly isUserCreationModalError = signal<boolean>(false);
  readonly step = signal<"credentials" | "info">("credentials");

  // login
  readonly loginForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  // register
  readonly registerForm = this.fb.group(
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
    },
    { validators: [this.validationService.useMatchValidator("password", "repeatedPassword")] }
  );

  // reset password
  readonly resetForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });

  // set password
  readonly passwordForm = this.fb.group(
    {
      password: ["", [Validators.required, this.validationService.usePasswordValidator(8)]],
      passwordRepeated: ["", [Validators.required]],
    },
    { validators: [this.validationService.useMatchValidator("password", "passwordRepeated")] }
  );

  // Login Component
  toggleShowPassword(section: "login" | "register", type?: "repeat" | "first") {
    if (section === "login") {
      this.showPassword.set(!this.showPassword());
    } else {
      if (type === "repeat") {
        this.showPasswordRepeat.set(!this.showPasswordRepeat());
      } else {
        this.showPassword.set(!this.showPassword());
      }
    }
  }

  // register
  onInfoStep(registerForm: FormGroup) {
    const fields = [
      registerForm.get("email"),
      registerForm.get("password"),
      registerForm.get("repeatedPassword"),
    ];

    const errors = fields.map(field => {
      field?.markAsTouched();
      return !!field?.valid;
    });

    if (errors.every(Boolean) && this.registerAgreement() && this.ageAgreement()) {
      this.step.set("info");
    }
  }

  prepareFormValues(registerForm: FormGroup) {
    const form = {
      ...registerForm.value,
      birthday: registerForm.value.birthday
        ? dayjs(registerForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
        : undefined,
    };
    delete form.repeatedPassword;

    return form;
  }

  onSubmit(registerForm: FormGroup): FormGroup | null {
    if (this.step() === "credentials") {
      this.credsSubmitInitiated.set(true);
      this.onInfoStep(registerForm);
      return null;
    }

    if (this.step() === "info") {
      this.infoSubmitInitiated.set(true);

      if (registerForm.invalid) {
        registerForm.markAllAsTouched();
        return null;
      }

      return registerForm;
    }

    return null;
  }
}
