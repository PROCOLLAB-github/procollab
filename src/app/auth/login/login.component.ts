/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
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
  loginForm: FormGroup;
  loginMem = false;

  errorWrongAuth = false;
  errorMessage = ErrorMessage;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private validationService: ValidationService
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (!this.validationService.getFormValidation(this.loginForm)) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe(
      res => {
        this.authService.memTokens(res, !this.loginMem);
        this.router.navigateByUrl("/office");
      },
      error => {
        if (error.status === 403) {
          this.errorWrongAuth = true;
        }
      }
    );
  }
}
