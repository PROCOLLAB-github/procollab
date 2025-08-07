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

/**
 * Токен для инъекции базового URL Skills API
 *
 * Используется в SkillsApiService для работы с отдельным API навыков
 * Позволяет использовать разные API endpoints в одном приложении
 *
 * Пример конфигурации в модуле:
 * providers: [
 *   { provide: SKILLS_API_URL, useValue: 'https://skills-api.procollab.ru' }
 * ]
 */
export const SKILLS_API_URL = new InjectionToken<string>("SKILLS_API_URL");
