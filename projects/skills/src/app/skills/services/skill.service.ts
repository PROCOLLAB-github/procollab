/** @format */

import { inject, Injectable } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill, TasksResponse } from "../../../models/skill.model";
import { HttpParams } from "@angular/common/http";

/**
 * Сервис навыков
 *
 * Управляет всеми операциями, связанными с навыками, включая:
 * - Обнаружение и просмотр навыков
 * - Детали навыков и управление заданиями
 * - Отслеживание прогресса пользователя
 * - Управление состоянием выбора навыков
 *
 * Этот сервис предоставляет интерфейс между фронтендом и бэкендом
 * для всей функциональности, связанной с навыками на платформе обучения.
 */
@Injectable({
  providedIn: "root",
})
export class SkillService {
  private readonly COURSES_URL = "/courses";

  apiService = inject(SkillsApiService);

  // Локальное управление состоянием для текущего выбора навыка
  private skillId: number | null = null;
  private storageKey = "skillId";

  /**
   * Получает все доступные навыки с пагинацией
   *
   * @returns Observable<ApiPagination<Skill>> Пагинированный список всех навыков в системе
   */
  getAll() {
    return this.apiService.get<ApiPagination<Skill>>(`${this.COURSES_URL}/all-skills/`);
  }

  /**
   * Получает навыки, которые отмечены/выбраны для текущего пользователя
   *
   * @param limit - Количество навыков для получения на страницу (по умолчанию: 5)
   * @param offset - Количество навыков для пропуска для пагинации (по умолчанию: 0)
   * @returns Observable<ApiPagination<Skill>> Пагинированный список выбранных навыков пользователя
   */
  getAllMarked(limit = 5, offset = 0) {
    return this.apiService.get<ApiPagination<Skill>>(
      `${this.COURSES_URL}/choose-skills/`,
      new HttpParams({
        fromObject: {
          limit,
          offset,
        },
      })
    );
  }

  /**
   * Получает подробную информацию о конкретном навыке
   *
   * @param skillId - Уникальный идентификатор навыка
   * @returns Observable<Skill> Полная информация о навыке, включая описание и требования
   */
  getDetail(skillId: number) {
    return this.apiService.get<Skill>(`${this.COURSES_URL}/skill-details/${skillId}`);
  }

  /**
   * Получает все задания, связанные с конкретным навыком
   *
   * @param skillId - Уникальный идентификатор навыка
   * @returns Observable<TasksResponse> Задания, статистика прогресса и статус завершения
   */
  getTasks(skillId: number) {
    return this.apiService.get<TasksResponse>(`${this.COURSES_URL}/tasks-of-skill/${skillId}`);
  }

  /**
   * Устанавливает ID текущего выбранного навыка в памяти и localStorage
   *
   * Этот метод используется для поддержания состояния при навигации между
   * страницами и компонентами, связанными с навыками.
   *
   * @param id - ID навыка для установки как текущий выбор
   */
  setSkillId(id: number) {
    this.skillId = id;
    localStorage.setItem(this.storageKey, JSON.stringify(id));
  }

  /**
   * Получает ID текущего выбранного навыка
   *
   * Проверяет localStorage для сохранения между сессиями браузера.
   *
   * @returns number | null - ID текущего выбранного навыка или null, если ничего не выбрано
   */
  getSkillId() {
    const skillValue = localStorage.getItem(this.storageKey);
    return skillValue ? JSON.parse(skillValue) : null;
  }
}
