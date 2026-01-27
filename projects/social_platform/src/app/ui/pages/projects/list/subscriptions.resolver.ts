/** @format */

import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { switchMap } from "rxjs";
import { SubscriptionService } from "projects/social_platform/src/app/api/subsriptions/subscription.service";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { AuthService } from "projects/social_platform/src/app/api/auth";

/**
 * РЕЗОЛВЕР ДЛЯ ПОЛУЧЕНИЯ ПОДПИСОК ПОЛЬЗОВАТЕЛЯ
 *
 * Назначение:
 * - Предзагружает данные проектов, на которые подписан текущий пользователь
 * - Обеспечивает наличие данных о подписках в компоненте на момент его инициализации
 * - Используется в роутинге Angular для маршрута "подписки"
 *
 * @params
 * - Неявно: внедряет AuthService и SubscriptionService через inject()
 * - Параметры маршрута и состояние роутера (не используются в данной реализации)
 *
 * @returns:
 * - Observable<{ results: Project[] }> - объект с массивом проектов-подписок
 * - Структура соответствует формату API для совместимости с другими резолверами
 *
 * 1. Внедряет AuthService и SubscriptionService через функцию inject()
 * 2. Получает профиль текущего пользователя через authService.profile
 * 3. Использует switchMap для переключения на запрос подписок с ID пользователя
 * 4. Вызывает subscriptionService.getSubscriptions(userId) для получения подписок
 * 5. Возвращает Observable с проектами, на которые подписан пользователь
 *
 * - Подключается к маршруту в конфигурации роутера для страницы подписок
 * - Результат доступен в компоненте через route.data['data']
 *
 * Особенности:
 * - Использует функциональный подход (ResolveFn) вместо класса
 * - Требует авторизованного пользователя для получения подписок
 * - Использует switchMap для избежания вложенных подписок
 * - Возвращает данные в формате, совместимом с другими резолверами проектов
 *
 * - AuthService - для получения данных текущего пользователя
 * - SubscriptionService - для получения списка подписок пользователя
 */
export const ProjectsSubscriptionsResolver: ResolveFn<{ results: Project[] }> = () => {
  const authService = inject(AuthService);
  const subscriptionService = inject(SubscriptionService);

  return authService.profile.pipe(switchMap(p => subscriptionService.getSubscriptions(p.id)));
};
