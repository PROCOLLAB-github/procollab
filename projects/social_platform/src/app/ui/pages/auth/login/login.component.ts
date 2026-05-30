/** @format */

import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ControlErrorPipe, TokenService } from "@corelib";
import { RouterLink } from "@angular/router";
import { ButtonComponent, IconComponent, InputComponent } from "@ui/primitives";
import { CommonModule } from "@angular/common";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { ClickOutsideModule } from "ng-click-outside";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { AuthLoginService } from "@api/auth/facades/auth-login.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Форма входа пользователя в систему. */
@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrl: "./login.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        InputComponent,
        ButtonComponent,
        IconComponent,
        ControlErrorPipe,
        TooltipComponent,
        ClickOutsideModule,
    ],
    providers: [AuthLoginService, AuthUIInfoService, TooltipInfoService]
})
export class LoginComponent implements OnInit {
  private readonly authLoginService = inject(AuthLoginService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly tokenService = inject(TokenService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly loginForm = this.authUIInfoService.loginForm;
  protected readonly loginIsSubmitting = this.authUIInfoService.loginIsSubmitting;

  protected readonly errorWrongAuth = this.authUIInfoService.errorWrongAuth;

  protected readonly errorMessage = ErrorMessage;

  protected readonly showPassword = this.authUIInfoService.showPassword;
  protected readonly isHintLoginVisible = computed(() =>
    this.tooltipInfoService.isVisible("login")
  );
  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.tokenService.clearTokens();
  }

  ngOnDestroy(): void {
    this.authLoginService.destroy();
  }

  toggleTooltip(): void {
    this.tooltipInfoService.toggleTooltip("login");
  }

  toggleShowPassword() {
    this.authUIInfoService.toggleShowPassword("login");
  }

  onSubmit() {
    this.authLoginService.onSubmit();
  }
}
