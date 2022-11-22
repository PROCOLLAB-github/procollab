/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "./services";
import { AuthComponent } from "./auth.component";
import { AuthRoutingModule } from "./auth-routing.module";
import { LoginComponent } from "./login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { UiModule } from "../ui/ui.module";
import { RegisterComponent } from "./register/register.component";
import { CoreModule } from "../core/core.module";
import { EmailVerificationComponent } from "./email-verification/email-verification.component";
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';

@NgModule({
  declarations: [AuthComponent, LoginComponent, RegisterComponent, EmailVerificationComponent, ConfirmEmailComponent],
  providers: [AuthService],
  imports: [CommonModule, AuthRoutingModule, CoreModule, ReactiveFormsModule, UiModule]
})
export class AuthModule {
}
