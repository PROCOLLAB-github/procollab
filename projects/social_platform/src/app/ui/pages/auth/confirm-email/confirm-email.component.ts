/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { AuthEmailService } from "@api/auth/facades/auth-email.service";

/** Обрабатывает подтверждение email через токены из URL. */
@Component({
  selector: "app-confirm-email",
  templateUrl: "./confirm-email.component.html",
  styleUrl: "./confirm-email.component.scss",
  providers: [AuthEmailService],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmailComponent implements OnInit {
  private readonly authEmailService = inject(AuthEmailService);

  ngOnInit(): void {
    this.authEmailService.initializationTokens();
  }
}
