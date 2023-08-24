/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { AuthService } from "@auth/services";
import { ValidationService } from "@core/services";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly validationService: ValidationService
  ) {
    this.resetForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  resetForm: FormGroup;
  isSubmitting = false;

  errorMessage = ErrorMessage;

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.resetForm)) return;

    this.authService.resetEmail(this.resetForm.value.email).subscribe(() => {
      console.log("sdlfkj");
    });
  }
}
