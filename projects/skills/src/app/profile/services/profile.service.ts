/** @format */

import { inject, Injectable } from "@angular/core";
import { Profile, UserData } from "../../../models/profile.model";
import { SkillsApiService } from "projects/core/src/lib/services/api/skillsApi.service";
import { SubscriptionData } from "@corelib";

/**
 * Служба профилей
 *
 * Управляет всеми операциями, связанными с профилями пользователей, включая:
 * - Получение и управление данными пользователей
 * - Синхронизация профилей с бэкэндом
 * - Управление подписками
 * - Выбор и обновление навыков
 *
 * Эта служба выступает в качестве основного интерфейса между фронтендом
 * и бэкэндом для всех функций, связанных с профилями.
 */
@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly PROGRESS_URL = "/progress";
  private readonly SUBSCRIPTION_URL = "/subscription";

  private apiService = inject(SkillsApiService);

  /**
   * Получает информацию о профиле текущего пользователя.
   *
   * @returns Observable<Profile> Полные данные профиля, включая прогресс и достижения.
   */
  getProfile() {
    return this.apiService.get<Profile>(`${this.PROGRESS_URL}/profile/`);
  }

  /**
   * Fetches basic user data and account information
   *
   * @returns Observable<UserData> Essential user information for display and navigation
   */
  getUserData() {
    return this.apiService.get<UserData>(`${this.PROGRESS_URL}/user-data/`);
  }

  /**
   * Получает текущий статус подписки и подробную информацию о ней.
   *
   * @returns Observable<SubscriptionData> Информация о подписке, включая тип тарифного плана и статус.
   */
  getSubscriptionData() {
    return this.apiService.get<SubscriptionData>(`${this.PROGRESS_URL}/subscription-data/`);
  }

  /**
   * Обновляет настройки автоматического продления подписки пользователя.
   *
   * @param allowed — следует ли включить автоматическое продление.
   * @returns Observable<any> Ответ, подтверждающий обновление.
   */
  updateSubscriptionDate(allowed: boolean) {
    return this.apiService.patch(`${this.PROGRESS_URL}/update-auto-renewal/`, {
      is_autopay_allowed: allowed,
    });
  }

  /**
   * Отменяет текущую подписку и обрабатывает возврат средств, если применимо.
   *
   * @returns Observable<any> Ответ, подтверждающий отмену.
   */
  cancelSubscription() {
    return this.apiService.post(`${this.SUBSCRIPTION_URL}/refund`, {});
  }

  /**
   * Добавляет новые навыки в профиль обучения пользователя.
   *
   * @param skills — массив идентификаторов навыков, которые необходимо добавить в профиль пользователя.
   * @returns Observable<any> Ответ, подтверждающий добавление навыков.
   */
  addSkill(skills: number[]) {
    return this.apiService.patch(`${this.PROGRESS_URL}/add-skills/`, skills);
  }

  /**
   * Синхронизирует данные локального профиля с бэкэндом.
   *
   * Этот метод гарантирует, что профиль пользователя будет обновлен
   * с учетом последней информации из основного приложения.
   * Должен вызываться при инициализации приложения и после значительных изменений.
   *
   * @returns Observable<any> Ответ, подтверждающий синхронизацию.
   */
  syncProfile() {
    return this.apiService.post(`${this.PROGRESS_URL}/sync-profile/`, {});
  }
}
