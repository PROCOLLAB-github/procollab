/** @format */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ErrorMessage } from "@error/models/error-message";
import { ValidationService } from "src/app/core/services";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly validationService: ValidationService,
    private readonly cdref: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  loginForm: FormGroup;
  loginIsSubmitting = false;

  errorWrongAuth = false;

  errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.authService.clearTokens();
  }

  onSubmit() {
    const redirectType = this.route.snapshot.queryParams["redirect"];

    if (!this.validationService.getFormValidation(this.loginForm) || this.loginIsSubmitting) {
      return;
    }

    this.loginIsSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.authService.memTokens(res);
        this.loginIsSubmitting = false;

        this.cdref.detectChanges();

        if (!redirectType)
          this.router
            .navigateByUrl("/office")
            .then(() => console.debug("Route changed from LoginComponent"));
        else if (redirectType === "program")
          this.router
            .navigateByUrl("/office/program")
            .then(() => console.debug("Route changed from LoginComponent"));
      },
      error: error => {
        if (error.status === 401) {
          this.errorWrongAuth = true;
        }

        this.loginIsSubmitting = false;
        this.cdref.detectChanges();
      },
    });
  }
}
