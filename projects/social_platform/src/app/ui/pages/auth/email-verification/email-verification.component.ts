/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { AuthEmailService } from "@api/auth/facades/auth-email.service";
import { CommonModule } from "@angular/common";

/** Страница ожидания подтверждения email с возможностью повторной отправки. */
@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.component.html",
  styleUrl: "./email-verification.component.scss",
  providers: [AuthEmailService],
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerificationComponent implements OnInit {
  private readonly authEmailService = inject(AuthEmailService);

  protected readonly counter = this.authEmailService.counter;

  ngOnInit(): void {
    this.authEmailService.initializationEmail();

    this.authEmailService.initializationTimer();
  }

  onResend(): void {
    this.authEmailService.onResend();
  }
}
