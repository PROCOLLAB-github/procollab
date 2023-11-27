/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "./services";
import { AuthComponent } from "./auth.component";
import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { UiModule } from "@ui/ui.module";
import { RegisterComponent } from "./register/register.component";
import { CoreModule } from "@core/core.module";
import { EmailVerificationComponent } from "./email-verification/email-verification.component";
import { ConfirmEmailComponent } from "./confirm-email/confirm-email.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { SetPasswordComponent } from './set-password/set-password.component';
import { ConfirmPasswordResetComponent } from './confirm-password-reset/confirm-password-reset.component';

@NgModule({
    providers: [AuthService],
    imports: [CommonModule, AuthRoutingModule, CoreModule, ReactiveFormsModule, UiModule, AuthComponent,
        LoginComponent,
        RegisterComponent,
        EmailVerificationComponent,
        ConfirmEmailComponent,
        ResetPasswordComponent,
        SetPasswordComponent,
        ConfirmPasswordResetComponent],
})
export class AuthModule {}
