/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ValidationService } from "../../core/services";

@Component({
  selector: "app-login",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ["", [Validators.required]],
        surname: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        birthday: ["", [Validators.required]],
        password: ["", [Validators.required]],
        repeatedPassword: ["", [Validators.required]],
      },
      { validators: [this.validationService.useMatchValidator("password", "repeatedPassword")] }
    );
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const form = { ...this.registerForm.value };
    delete form.repeatedPassword;
    this.authService.register(form).subscribe(res => {
      this.authService.memTokens(res);
    });
  }
}
