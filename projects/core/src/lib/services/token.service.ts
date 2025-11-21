/** @format */

import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { RefreshResponse } from "@auth/models/http.model";
import { plainToInstance } from "class-transformer";
import { Tokens } from "@auth/models/tokens.model";
import Cookies, { CookieAttributes } from "js-cookie";
import { ApiService, PRODUCTION } from "@corelib";

/**
 * Сервис для управления JWT токенами аутентификации
 *
 * Основные функции:
 * - Хранение access и refresh токенов в HTTP-only cookies
 * - Автоматическое обновление токенов при истечении срока действия
 * - Управление настройками cookies в зависимости от окружения
 * - Очистка токенов при выходе из системы
 *
 * Безопасность:
 * - Токены хранятся в cookies (более безопасно чем localStorage)
 * - В production используется domain-specific cookies
 * - Автоматическое истечение cookies через 30 дней
 *
 * Интеграция:
 * - Работает с BearerTokenInterceptor для автоматического обновления токенов
 * - Использует class-transformer для типизации ответов API
 */
@Injectable({
  providedIn: "root",
})
export class TokenService {
  private readonly TOKEN_API_URL = "/api/token";

  constructor(private apiService: ApiService, @Inject(PRODUCTION) private production: boolean) {}

  /**
   * Обновляет access токен используя refresh токен
   * @returns Observable с новой парой токенов (access + refresh)
   *
   * Процесс обновления:
   * 1. Извлекает текущий refresh токен из cookies
   * 2. Отправляет запрос на /api/token/refresh/
   * 3. Получает новую пару токенов
   * 4. Преобразует ответ в типизированный объект RefreshResponse
   *
   * Используется автоматически в BearerTokenInterceptor при получении 401 ошибки
   */
  refreshTokens(): Observable<RefreshResponse> {
    return this.apiService
      .post(`${this.TOKEN_API_URL}/refresh/`, {
        refresh: this.getTokens()?.refresh,
      })
      .pipe(map(json => plainToInstance(RefreshResponse, json)));
  }

  /**
   * Возвращает настройки cookies в зависимости от окружения
   * @returns Объект с настройками для js-cookie
   *
   * Production настройки:
   * - domain: ".procollab.ru" - cookies доступны на всех поддоменах
   * - expires: 30 дней - автоматическое истечение
   *
   * Development настройки:
   * - Используются дефолтные настройки браузера
   * - Cookies привязаны к текущему домену
   */
  getCookieOptions(): CookieAttributes {
    if (this.production) {
      return {
        domain: ".procollab.ru", // Домен для production окружения
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 дней
        secure: true,
        sameSite: "None",
      };
    }

    return {}; // Дефолтные настройки для development
  }

  /**
   * Извлекает токены из cookies
   * @returns Объект с access и refresh токенами или null если токенов нет
   *
   * Проверяет наличие обоих токенов:
   * - Если отсутствует любой из токенов, возвращает null
   * - Если оба токена присутствуют, возвращает объект Tokens
   *
   * Используется в BearerTokenInterceptor для добавления Authorization header
   */
  getTokens(): Tokens | null {
    const access = Cookies.get("accessToken");
    const refresh = Cookies.get("refreshToken");

    // Проверяем наличие обоих токенов
    if (!access || !refresh) {
      return null;
    }

    return { access, refresh };
  }

  /**
   * Удаляет токены из cookies
   * Используется при выходе пользователя из системы
   *
   * Удаляет оба токена с учетом настроек окружения:
   * - В production удаляет с правильным доменом
   * - В development удаляет с дефолтными настройками
   */
  clearTokens(): void {
    const options = this.getCookieOptions();
    Cookies.remove("accessToken", options);
    Cookies.remove("refreshToken", options);
  }

  /**
   * Сохраняет токены в cookies
   * @param tokens - Объект с access и refresh токенами
   *
   * Сохраняет оба токена с настройками окружения:
   * - Использует правильный домен для production
   * - Устанавливает срок истечения cookies
   *
   * Вызывается после успешной аутентификации или обновления токенов
   */
  memTokens(tokens: Tokens): void {
    const options = this.getCookieOptions();
    Cookies.set("accessToken", tokens.access, options);
    Cookies.set("refreshToken", tokens.refresh, options);
  }
}
