/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { ProjectSubscriber } from "@office/models/project-subscriber.model";
import { ApiPagination } from "@office/models/api-pagination.model";
import { Project } from "@office/models/project.model";
import { HttpParams } from "@angular/common/http";

/**
 * Сервис для управления подписками на проекты
 *
 * Предоставляет функциональность для:
 * - Получения списка подписчиков проекта
 * - Подписки на проекты и отписки от них
 * - Получения списка проектов, на которые подписан пользователь
 */
@Injectable({
  providedIn: "root",
})
export class SubscriptionService {
  private readonly PROJECTS_URL = "/projects";
  private readonly AUTH_USERS_URL = "/auth/users";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает список всех подписчиков конкретного проекта
   *
   * @param projectId - идентификатор проекта
   * @returns Observable<ProjectSubscriber[]> - массив подписчиков с информацией о пользователях
   */
  getSubscribers(projectId: number): Observable<ProjectSubscriber[]> {
    return this.apiService.get<ProjectSubscriber[]>(
      `${this.PROJECTS_URL}/${projectId}/subscribers/`
    );
  }

  /**
   * Подписывает текущего пользователя на проект
   * После подписки пользователь будет получать уведомления об обновлениях проекта
   *
   * @param projectId - идентификатор проекта для подписки
   * @returns Observable<void> - завершается при успешной подписке
   */
  addSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`${this.PROJECTS_URL}/${projectId}/subscribe/`, {});
  }

  /**
   * Получает список проектов, на которые подписан указанный пользователь
   * Поддерживает пагинацию и фильтрацию
   *
   * @param userId - идентификатор пользователя
   * @param params - параметры запроса (limit, offset, фильтры)
   * @returns Observable<ApiPagination<Project>> - объект с массивом проектов и метаданными пагинации
   */
  getSubscriptions(userId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get(`${this.AUTH_USERS_URL}/${userId}/subscribed_projects`, params);
  }

  /**
   * Отписывает текущего пользователя от проекта
   * После отписки пользователь перестанет получать уведомления об обновлениях проекта
   *
   * @param projectId - идентификатор проекта для отписки
   * @returns Observable<void> - завершается при успешной отписке
   */
  deleteSubscription(projectId: number): Observable<void> {
    return this.apiService.post<void>(`${this.PROJECTS_URL}/${projectId}/unsubscribe/`, {});
  }
}
