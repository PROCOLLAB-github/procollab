/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { IconComponent } from "@ui/components";
import { AuthEmailService } from "projects/social_platform/src/app/api/auth/facades/auth-email.service";
import { CommonModule } from "@angular/common";

/**
 * Компонент подтверждения email адреса
 *
 * Назначение: Отображает страницу ожидания подтверждения email после регистрации
 * Принимает: email адрес через query параметры маршрута
 * Возвращает: Интерфейс с возможностью повторной отправки письма подтверждения
 *
 * Функциональность:
 * - Показывает инструкции по подтверждению email
 * - Реализует таймер для повторной отправки письма (60 секунд)
 * - Позволяет отправить письмо подтверждения повторно
 * - Получает email из query параметров маршрута
 */
@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.component.html",
  styleUrl: "./email-verification.component.scss",
  providers: [AuthEmailService],
  imports: [CommonModule, IconComponent],
  standalone: true,
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  private readonly authEmailService = inject(AuthEmailService);

  protected readonly counter = this.authEmailService.counter;

  ngOnInit(): void {
    this.authEmailService.initializationEmail();

    this.authEmailService.initializationTimer();
  }

  ngOnDestroy(): void {
    this.authEmailService.destroy();
  }

  onResend(): void {
    this.authEmailService.onResend();
  }
}
