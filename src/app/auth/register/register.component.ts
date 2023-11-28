/** @format */

import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "../services";
import { ValidationService } from "@core/services";
import { ErrorMessage } from "@error/models/error-message";
import { Router, RouterLink } from "@angular/router";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import { ControlErrorPipe } from "../../core/pipes/control-error.pipe";
import { ButtonComponent } from "../../ui/components/button/button.component";
import { CheckboxComponent } from "../../ui/components/checkbox/checkbox.component";
import { InputComponent } from "../../ui/components/input/input.component";
import { NgIf, NgFor } from "@angular/common";

dayjs.extend(cpf);

@Component({
    selector: "app-login",
    templateUrl: "./register.component.html",
    styleUrl: "./register.component.scss",
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        InputComponent,
        NgFor,
        CheckboxComponent,
        ButtonComponent,
        RouterLink,
        ControlErrorPipe,
    ],
})
export class RegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
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
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        repeatedPassword: ["", [Validators.required]],
      },
      { validators: [this.validationService.useMatchValidator("password", "repeatedPassword")] }
    );
  }

  ngOnInit(): void {
    this.authService.clearTokens();
  }

  registerForm: FormGroup;
  registerAgreement = false;
  registerIsSubmitting = false;
  credsSubmitInitiated = false;
  infoSubmitInitiated = false;

  serverErrors: string[] = [];

  step: "credentials" | "info" = "credentials";

  errorMessage = ErrorMessage;

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

    if (errors.every(Boolean) && this.registerAgreement) {
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
