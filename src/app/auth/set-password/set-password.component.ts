/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "@core/services";
import { ErrorMessage } from "@error/models/error-message";

@Component({
  selector: "app-set-password",
  templateUrl: "./set-password.component.html",
  styleUrls: ["./set-password.component.scss"],
})
export class SetPasswordComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService
  ) {
    this.loginForm = this.fb.group(
      {
        password: ["", [Validators.required]],
        passwordRepeated: [""],
      },
      { validators: [validationService.useMatchValidator("password", "passwordRepeated")] }
    );
  }

  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = ErrorMessage;
  errorRequest = false;

  ngOnInit(): void {}

  onSubmit() {}
}
