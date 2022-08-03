/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ErrorMessage } from "../../error/models/error-message";

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

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.loginForm.invalid) {
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
