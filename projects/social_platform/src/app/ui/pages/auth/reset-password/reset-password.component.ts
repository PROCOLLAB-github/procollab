/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ControlErrorPipe } from "@corelib";
import { ButtonComponent, InputComponent } from "@ui/primitives";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { AuthPasswordService } from "@api/auth/facades/auth-password.service";

/** Форма запроса сброса пароля по email. */
@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.scss",
  standalone: true,
  providers: [AuthPasswordService, AuthUIInfoService],
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, ControlErrorPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly authPasswordService = inject(AuthPasswordService);

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.authPasswordService.destroy();
  }

  protected readonly resetForm = this.authUIInfoService.resetForm;
  protected readonly isSubmitting = this.authUIInfoService.isSubmitting;
  protected readonly errorServer = this.authUIInfoService.errorServer;

  protected readonly errorMessage = ErrorMessage;

  onSubmit(): void {
    this.authPasswordService.onSubmitResetPassword();
  }
}
