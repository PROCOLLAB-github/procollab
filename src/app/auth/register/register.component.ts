/** @format */

import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ValidationService } from "../../core/services";
import { ErrorMessage } from "../../error/models/error-message";
import { SelectComponent } from "src/app/ui/components";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
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
      password: ["", [Validators.required, Validators.minLength(6)]]
    });
  }

  registerForm: FormGroup;
  registerAgreement = false;
  registerIsSubmitting = false;

  userExistError = false;

  errorMessage = ErrorMessage;

  statusOptions: SelectComponent["options"] = [
    { id: 1, value: "Ученик", label: "Ученик" },
    { id: 2, value: "Ментор", label: "Ментор" }
  ];

  ngOnInit(): void {
  }

  onSubmit() {
    if (!this.validationService.getFormValidation(this.registerForm) || !this.registerAgreement) {
      return;
    }

    const form = { ...this.registerForm.value };
    delete form.repeatedPassword;

    this.registerIsSubmitting = true;

    this.authService.register(form).subscribe({
      next: res => {
        this.authService.memTokens(res);
        this.router
          .navigateByUrl("/auth/verification/email")
          .then(() => console.debug("Route changed from RegisterComponent"));

        this.registerIsSubmitting = false;

        this.cdref.detectChanges();
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
      }
    });
  }
}
