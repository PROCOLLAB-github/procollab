/** @format */

import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ValidationService } from "@core/services";
import { ErrorMessage } from "@error/models/error-message";
import { SelectComponent } from "src/app/ui/components";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";

dayjs.extend(cpf);

@Component({
  selector: "app-login",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private validationService: ValidationService,
    private cdref: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      repeatedPassword: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  registerForm: FormGroup;
  registerAgreement = false;
  registerIsSubmitting = false;

  userExistError = false;

  errorMessage = ErrorMessage;
  // TODO: unhardcode later on
  roles$: Observable<SelectComponent["options"]> = of([
    { id: 1, value: 1, label: "Участник" },
    { id: 2, value: 2, label: "Ментор" },
    { id: 3, value: 3, label: "Эксперт" },
    { id: 4, value: 4, label: "Инвестор" },
  ]);

  onSubmit() {
    if (!this.validationService.getFormValidation(this.registerForm) || !this.registerAgreement) {
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
          .navigateByUrl("/auth/verification/email")
          .then(() => console.debug("Route changed from RegisterComponent"));
      },
      error: error => {
        if (
          error.status === 400 &&
          error.error.email.some((msg: string) => msg.includes("email"))
        ) {
          this.userExistError = true;
        }

        this.registerIsSubmitting = false;
        this.cdref.detectChanges();
      },
    });
  }
}
