/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { AuthPasswordService } from "@api/auth/facades/auth-password.service";

/** Страница подтверждения отправки письма для сброса пароля. */
@Component({
    selector: "app-confirm-password-reset",
    templateUrl: "./confirm-password-reset.component.html",
    styleUrl: "./confirm-password-reset.component.scss",
    providers: [AuthPasswordService],
    imports: [AsyncPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmPasswordResetComponent implements OnInit {
  private readonly authPasswordService = inject(AuthPasswordService);

  protected readonly email = this.authPasswordService.email;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.authPasswordService.destroy();
  }
}
