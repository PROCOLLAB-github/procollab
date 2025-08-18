/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService } from "@corelib";

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
  standalone: true,
})
export class ConfirmEmailComponent implements OnInit {
  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(queries => {
      const { access_token: accessToken, refresh_token: refreshToken } = queries;
      this.tokenService.memTokens({ access: accessToken, refresh: refreshToken });

      if (this.tokenService.getTokens() !== null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from ConfirmEmailComponent"));
      }
    });
  }
}
