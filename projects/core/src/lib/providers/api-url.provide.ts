/** @format */
import { InjectionToken } from "@angular/core";

/**
 * Токен для инъекции базового URL основного API
 *
 * Используется в ApiService для формирования полных URL запросов
 * Позволяет легко изменять базовый URL в зависимости от окружения
 *
 * Пример конфигурации в модуле:
 * providers: [
 *   { provide: API_URL, useValue: 'https://api.procollab.ru' }
 * ]
 */
export const API_URL = new InjectionToken<string>("API_URL");
