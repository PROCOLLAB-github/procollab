/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ValidationService } from "../../core/services";
import { ErrorMessage } from "../../error/models/error-message";
import { SelectComponent } from "src/app/ui/components";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  registerAgreement = false;

  errorMessage = ErrorMessage;

  statusOptions: SelectComponent["options"] = [
    { id: 1, value: "Ученик", label: "Ученик" },
    { id: 2, value: "Ментор", label: "Ментор" },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private validationService: ValidationService
  ) {
    this.registerForm = this.fb.group({
      name: ["", [Validators.required]],
      surname: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (!this.validationService.getFormValidation(this.registerForm) || !this.registerAgreement) {
      return;
    }

    const form = { ...this.registerForm.value };
    delete form.repeatedPassword;

    this.authService.register(form).subscribe(res => {
      this.authService.memTokens(res);
      this.router.navigateByUrl("/office");
    });
  }
}
