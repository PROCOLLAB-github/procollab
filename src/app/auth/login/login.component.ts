/** @format */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ErrorMessage } from "../../error/models/error-message";
import { ValidationService } from "src/app/core/services";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private validationService: ValidationService,
    private cdref: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  loginForm: FormGroup;
  loginMem = false;
  loginIsSubmitting = false;

  errorWrongAuth = false;

  errorMessage = ErrorMessage;

  ngOnInit(): void {}

  onSubmit() {
    if (!this.validationService.getFormValidation(this.loginForm) || this.loginIsSubmitting) {
      return;
    }

    this.loginIsSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe(
      res => {
        this.authService.memTokens(res);
        this.loginIsSubmitting = false;

        this.cdref.detectChanges();

        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from LoginComponent"));
      },
      error => {
        if (error.status === 403) {
          this.errorWrongAuth = true;
        }

        this.loginIsSubmitting = false;
        this.cdref.detectChanges();
      }
    );
  }
}
