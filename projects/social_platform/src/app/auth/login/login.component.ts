/** @format */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../services";
import { ErrorMessage } from "@error/models/error-message";
import { ControlErrorPipe, TokenService, ValidationService } from "projects/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/components";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
  ],
})
export class LoginComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly tokenService: TokenService,
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
    this.tokenService.clearTokens();
  }

  onSubmit() {
    const redirectType = this.route.snapshot.queryParams["redirect"];

    if (!this.validationService.getFormValidation(this.loginForm) || this.loginIsSubmitting) {
      return;
    }

    this.loginIsSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.tokenService.memTokens(res);
        this.loginIsSubmitting = false;

        this.cdref.detectChanges();

        if (!redirectType)
          this.router
            .navigateByUrl("/office")
            .then(() => console.debug("Route changed from LoginComponent"));
        else if (redirectType === "program")
          this.router
            .navigateByUrl("/office/program/list")
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
