/** @format */

import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiService, SKILLS_API_URL } from "@corelib";

/**
 * Специализированный API сервис для работы с Skills API
 *
 * Назначение:
 * - Расширяет базовый ApiService для работы с отдельным Skills API
 * - Использует отдельный базовый URL (SKILLS_API_URL) от основного API
 * - Наследует все методы от ApiService (get, post, put, patch, delete)
 *
 * Архитектурное решение:
 * - Позволяет работать с несколькими API endpoints в одном приложении
 * - Основной API (через ApiService) - для общих операций
 * - Skills API (через SkillsApiService) - для операций с навыками и подписками
 *
 * Использование:
 * - Инжектируется в компоненты и сервисы, которым нужен доступ к Skills API
 * - Автоматически использует правильный базовый URL
 * - Поддерживает все HTTP методы родительского класса
 */
@Injectable({
  providedIn: "root",
})
export class SkillsApiService extends ApiService {
  /**
   * Конструктор сервиса
   * @param http - HttpClient для выполнения HTTP запросов
   * @param apiUrl - Базовый URL для Skills API (инжектируется через SKILLS_API_URL токен)
   *
   * Пример конфигурации в модуле:
   * providers: [
   *   { provide: SKILLS_API_URL, useValue: 'https://skills-api.example.com' }
   * ]
   */
  constructor(http: HttpClient, @Inject(SKILLS_API_URL) apiUrl: string) {
    // Вызываем конструктор родительского класса с Skills API URL
    super(http, apiUrl);
  }

  // Наследует все методы от ApiService:
  // - get<T>(path, params?, options?)
  // - post<T>(path, body)
  // - put<T>(path, body)
  // - patch<T>(path, body)
  // - delete<T>(path, params?)

  // Все запросы будут выполняться относительно SKILLS_API_URL
  // Пример: skillsApi.get('/subscriptions') → GET https://skills-api.example.com/subscriptions
}
