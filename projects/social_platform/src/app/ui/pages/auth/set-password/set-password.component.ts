/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/primitives";
import { AuthPasswordService } from "@api/auth/facades/auth-password.service";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";

/** Форма установки нового пароля после сброса. */
@Component({
  selector: "app-set-password",
  templateUrl: "./set-password.component.html",
  styleUrl: "./set-password.component.scss",
  providers: [AuthPasswordService, AuthUIInfoService],
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, IconComponent, ControlErrorPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPasswordComponent implements OnInit {
  private readonly authPasswordService = inject(AuthPasswordService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

  protected readonly passwordForm = this.authUIInfoService.passwordForm;

  protected readonly isSubmitting = this.authUIInfoService.isSubmitting;
  protected readonly errorRequest = this.authUIInfoService.errorRequest;
  protected readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;

  protected readonly errorMessage = ErrorMessage;

  protected readonly showPassword = this.authUIInfoService.showPassword;
  protected readonly showPasswordRepeat = this.authUIInfoService.showPasswordRepeat;

  ngOnInit(): void {
    this.authPasswordService.init();
  }

  toggleShowPassword(type: "first" | "repeat") {
    this.authUIInfoService.toggleShowPassword("register", type);
  }

  onSubmit() {
    this.authPasswordService.onSubmitSetPassword();
  }
}
