/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ErrorMessage } from "../../error/models/error-message";
import { ValidationService } from "src/app/core/services";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginMem = false;

  errorWrongAuth = false;
  errorMessage = ErrorMessage;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.validationService.getFormValidation(this.loginForm)) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe(
      res => {
        this.authService.memTokens(res, !this.loginMem);
      },
      error => {
        if (error.error?.detail === "Incorrect email or password") {
          this.errorWrongAuth = true;
        }
      }
    );
  }
}
