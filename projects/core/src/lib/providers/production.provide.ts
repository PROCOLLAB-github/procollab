/** @format */

import { InjectionToken } from "@angular/core";

/**
 * Токен для инъекции флага production окружения
 *
 * Используется сервисами для изменения поведения в зависимости от окружения:
 * - TokenService: настройки cookies (домен, безопасность)
 * - Логирование: уровень детализации
 * - API endpoints: использование production или development URL
 * - Отладочная информация: показ в development, скрытие в production
 *
 * Пример конфигурации в модуле:
 * providers: [
 *   { provide: PRODUCTION, useValue: environment.production }
 * ]
 *
 * Использование в сервисах:
 * constructor(@Inject(PRODUCTION) private production: boolean) {
 *   if (this.production) {
 *     // Production логика
 *   } else {
 *     // Development логика
 *   }
 * }
 */
export const PRODUCTION = new InjectionToken<boolean>("PRODUCTION");
