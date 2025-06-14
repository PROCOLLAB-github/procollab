/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { ErrorMessage } from "@error/models/error-message";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@auth/services";
import { ButtonComponent, InputComponent } from "@ui/components";

@Component({
  selector: "app-set-password",
  templateUrl: "./set-password.component.html",
  styleUrl: "./set-password.component.scss",
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, ControlErrorPipe],
})
export class SetPasswordComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.passwordForm = this.fb.group(
      {
        password: ["", [Validators.required, Validators.minLength(8)]],
        passwordRepeated: ["", [Validators.required]],
      },
      { validators: [validationService.useMatchValidator("password", "passwordRepeated")] }
    );
  }

  passwordForm: FormGroup;
  isSubmitting = false;
  errorMessage = ErrorMessage;
  errorRequest = false;

  showPassword = false;

  ngOnInit(): void {}

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    const token = this.route.snapshot.queryParamMap.get("token");

    if (!token || !this.validationService.getFormValidation(this.passwordForm)) return;

    this.authService.setPassword(this.passwordForm.value.password, token).subscribe({
      next: () => {
        this.router.navigateByUrl("/auth/login").then(() => console.debug("SetPasswordComponent"));
      },
    });
  }
}
