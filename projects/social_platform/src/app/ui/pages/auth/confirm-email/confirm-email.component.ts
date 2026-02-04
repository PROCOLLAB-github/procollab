/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { AuthEmailService } from "projects/social_platform/src/app/api/auth/facades/auth-email.service";

/**
 * Компонент подтверждения email адреса
 *
 * Назначение: Обрабатывает подтверждение email через ссылку из письма
 * Принимает: Access и refresh токены из query параметров URL
 * Возвращает: Перенаправление в офис при успешном подтверждении
 *
 * Функциональность:
 * - Получает токены из query параметров URL
 * - Сохраняет токены в TokenService
 * - Перенаправляет пользователя в офис при успешной аутентификации
 * - Автоматически выполняется при переходе по ссылке из письма
 */
@Component({
  selector: "app-confirm-email",
  templateUrl: "./confirm-email.component.html",
  styleUrl: "./confirm-email.component.scss",
  providers: [AuthEmailService],
  imports: [CommonModule],
  standalone: true,
})
export class ConfirmEmailComponent implements OnInit {
  private readonly authEmailService = inject(AuthEmailService);

  ngOnInit(): void {
    this.authEmailService.initializationTokens();
  }
}
