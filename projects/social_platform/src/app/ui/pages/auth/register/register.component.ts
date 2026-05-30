/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { initial } from "@domain/shared/async-state";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlErrorPipe, TokenService } from "@corelib";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { RouterLink } from "@angular/router";
import { ButtonComponent, CheckboxComponent, InputComponent } from "@ui/primitives";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";
import { AuthRegisterService } from "@api/auth/facades/auth-register.service";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Двухэтапная форма регистрации нового пользователя. */
@Component({
    selector: "app-login",
    templateUrl: "./register.component.html",
    styleUrl: "./register.component.scss",
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        CheckboxComponent,
        ButtonComponent,
        ModalComponent,
        RouterLink,
        IconComponent,
        ControlErrorPipe,
    ],
    providers: [AuthRegisterService, AuthUIInfoService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private readonly authRegisterService = inject(AuthRegisterService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly tokenService = inject(TokenService);
  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  ngOnDestroy(): void {
    this.authRegisterService.destroy();
  }

  protected readonly registerForm = this.authUIInfoService.registerForm;
  protected readonly registerIsSubmitting = this.authUIInfoService.registerIsSubmitting;

  protected readonly registerAgreement = this.authUIInfoService.registerAgreement;
  protected readonly ageAgreement = this.authUIInfoService.ageAgreement;

  protected readonly showPassword = this.authUIInfoService.showPassword;
  protected readonly showPasswordRepeat = this.authUIInfoService.showPasswordRepeat;

  protected readonly isUserCreationModalError = this.authUIInfoService.isUserCreationModalError;

  protected readonly serverErrors = this.authRegisterService.serverErrors;

  protected readonly errorMessage = ErrorMessage;

  toggleShowPassword(type: "repeat" | "first") {
    this.authUIInfoService.toggleShowPassword("register", type);
  }

  onSendForm(): void {
    this.authRegisterService.onSendForm();
  }

  dismissCreationError(): void {
    this.authUIInfoService.register$.set(initial());
  }

  downloadPolicy(event: Event): void {
    event.stopPropagation();
    this.authRegisterService.downloadPolicy();
  }
}
