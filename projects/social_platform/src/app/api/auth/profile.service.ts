/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Achievement } from "../../domain/auth/user.model";
import { map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";
import { Approve } from "../../domain/skills/skill";

/**
 * Сервис управления профилем пользователя
 *
 * Назначение: Дополнительный сервис для операций с профилем пользователя
 * Принимает: Данные достижений, ID пользователей и навыков
 * Возвращает: Observable с результатами операций над достижениями и навыками
 *
 * Функциональность:
 * - Добавление, редактирование и удаление достижений пользователя
 * - Подтверждение и отмена подтверждения навыков пользователя
 * - Работа с API для операций профиля
 * - Использует class-transformer для преобразования данных
 * - Дополняет функциональность AuthService
 */
@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly AUTH_USERS_URL = "/auth/users";

  constructor(private apiService: ApiService) {}

  getAchievements(): Observable<Achievement[]> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/achievements/`);
  }

  addAchievement(achievement: Omit<Achievement, "id">): Observable<Achievement> {
    return this.apiService
      .post(`${this.AUTH_USERS_URL}/achievements/`, achievement)
      .pipe(map(achievement => plainToInstance(Achievement, achievement)));
  }

  deleteAchievement(achievementId: string): Observable<void> {
    return this.apiService.delete(`${this.AUTH_USERS_URL}/achievements/${achievementId}/`);
  }

  editAchievement(
    achievementId: string,
    achievement: Omit<Achievement, "id">
  ): Observable<Achievement> {
    return this.apiService.put(`${this.AUTH_USERS_URL}/achievement/${achievementId}/`, achievement);
  }

  approveSkill(userId: number, skillId: number): Observable<Approve> {
    return this.apiService.post(`${this.AUTH_USERS_URL}/${userId}/approve_skill/${skillId}/`, {});
  }

  unApproveSkill(userId: number, skillId: number): Observable<void> {
    return this.apiService.delete(`${this.AUTH_USERS_URL}/${userId}/approve_skill/${skillId}/`);
  }
}
